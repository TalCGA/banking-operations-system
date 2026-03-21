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

    public TransactionsController(BankingService bankingService)
    {
        _bankingService = bankingService;
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
    /// Validates all input fields, obtains a token, executes the transaction, and persists the result.
    /// </summary>
    /// <param name="request">The transaction details, including names, personal ID, amount, and action type.</param>
    /// <returns>The saved transaction record, including the final Status (Success or Failed).</returns>
    /// <response code="200">Transaction processed. Returns the saved record with Status as a string.</response>
    /// <response code="400">Validation failed. Returns field-level error messages.</response>
    [HttpPost("process")]
    [ProducesResponseType(typeof(Transaction), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Process([FromBody] TransactionRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _bankingService.ProcessTransactionAsync(request);
        return Ok(result);
    }
}
