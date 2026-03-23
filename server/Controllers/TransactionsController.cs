using BankingSystem.Models;
using BankingSystem.Services;
using Microsoft.AspNetCore.Mvc;

namespace BankingSystem.Controllers;

/// <summary>
/// Manages banking transactions: history retrieval and new transaction processing.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TransactionsController : ControllerBase
{
    private readonly BankingService _bankingService;
    private readonly ILogger<TransactionsController> _logger;

    public TransactionsController(BankingService bankingService, ILogger<TransactionsController> logger)
    {
        _bankingService = bankingService;
        _logger         = logger;
    }

    /// <summary>
    /// Retrieves the full transaction history, ordered from newest to oldest.
    /// </summary>
    /// <returns>A list of all recorded transactions.</returns>
    /// <response code="200">Returns the list of transactions.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Transaction>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _bankingService.GetAllTransactionsAsync();
        return Ok(transactions);
    }

    /// <summary>
    /// Processes a new banking transaction (Deposit or Withdrawal) through the external bank provider.
    /// </summary>
    /// <param name="request">The transaction details.</param>
    /// <returns>The saved transaction record with Status as a string.</returns>
    /// <response code="200">Transaction processed successfully.</response>
    /// <response code="400">Validation failed.</response>
    [HttpPost("process")]
    [ProducesResponseType(typeof(Transaction), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Process([FromBody] TransactionRequest request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning(
                "[VALIDATION] Process request failed — account {AccountNumber}, errors: {Errors}",
                request.AccountNumber,
                string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _bankingService.ProcessTransactionAsync(request);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "System Error" });
        }
    }

    /// <summary>
    /// Updates the amount of an existing transaction.
    /// For Failed transactions, re-runs the bank provider call (retry).
    /// </summary>
    /// <param name="id">The transaction ID.</param>
    /// <param name="request">The new amount.</param>
    /// <response code="200">Returns the updated transaction (with refreshed Status on retry).</response>
    /// <response code="404">Transaction not found.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Transaction), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAmountRequest request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning(
                "[VALIDATION] Update request failed for Transaction {Id} — amount {Amount}",
                id, request.Amount);
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _bankingService.UpdateTransactionAsync(id, request.Amount);
            if (result is null)
            {
                _logger.LogWarning("Attempted to update non-existent transaction {Id}", id);
                return NotFound();
            }
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "System Error" });
        }
    }

    /// <summary>
    /// Deletes a transaction from the database.
    /// </summary>
    /// <param name="id">The transaction ID.</param>
    /// <response code="204">Transaction deleted successfully.</response>
    /// <response code="404">Transaction not found.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _bankingService.DeleteTransactionAsync(id);
            if (!deleted)
            {
                _logger.LogWarning("Attempted to delete non-existent transaction {Id}", id);
                return NotFound();
            }
            return NoContent();
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "System Error" });
        }
    }
}
