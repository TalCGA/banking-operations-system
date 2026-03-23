using BankingSystem.Data;
using BankingSystem.Models;
using BankingSystem.Providers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BankingSystem.Services;

public class BankingService
{
    private readonly IBankProvider    _bankProvider;
    private readonly BankingDbContext _dbContext;
    private readonly ILogger<BankingService> _logger;

    public BankingService(
        IBankProvider bankProvider,
        BankingDbContext dbContext,
        ILogger<BankingService> logger)
    {
        _bankProvider = bankProvider;
        _dbContext    = dbContext;
        _logger       = logger;
    }

    public async Task<Transaction> ProcessTransactionAsync(TransactionRequest request)
    {
        _logger.LogInformation(
            "Initiating {ActionType} of {Amount}₪ for account {AccountNumber}",
            request.ActionType, request.Amount, request.AccountNumber);

        try
        {
            string token = await _bankProvider.GetTokenAsync(request.PersonalId);

            BankResponse response = await _bankProvider.ExecuteTransactionAsync(token, new Transaction
            {
                AccountNumber = request.AccountNumber,
                ActionType    = request.ActionType,
                Amount        = request.Amount,
            });

            var transaction = new Transaction
            {
                FullNameHebrew  = request.FullNameHebrew,
                FullNameEnglish = request.FullNameEnglish,
                BirthDate       = request.BirthDate,
                PersonalId      = request.PersonalId,
                Amount          = request.Amount,
                AccountNumber   = request.AccountNumber,
                ActionType      = request.ActionType,
                TransactionDate = DateTime.UtcNow,
                Status          = response.IsSuccess ? TransactionStatus.Success : TransactionStatus.Failed,
                FailureReason   = response.IsSuccess ? null : response.FailureReason,
            };

            _dbContext.Transactions.Add(transaction);
            await _dbContext.SaveChangesAsync();

            if (transaction.Status == TransactionStatus.Success)
                _logger.LogInformation(
                    "Transaction {Id} ({ActionType}, {Amount}₪ saved with status Success",
                    transaction.Id, transaction.ActionType, transaction.Amount);
            else
                _logger.LogWarning(
                    "[SIMULATED] Transaction {Id} ({ActionType}, {Amount}₪ declined by provider — reason: {FailureReason}",
                    transaction.Id, transaction.ActionType, transaction.Amount, transaction.FailureReason);

            return transaction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[TECHNICAL] Unexpected error while processing {ActionType} of {Amount}₪ for account {AccountNumber}",
                request.ActionType, request.Amount, request.AccountNumber);
            throw;
        }
    }

    public async Task<List<Transaction>> GetAllTransactionsAsync()
    {
        return await _dbContext.Transactions
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync();
    }

    public async Task<Transaction?> UpdateTransactionAsync(int id, decimal amount)
    {
        try
        {
            var transaction = await _dbContext.Transactions.FindAsync(id);
            if (transaction is null)
            {
                _logger.LogWarning("Update requested for non-existent transaction {Id}", id);
                return null;
            }

            decimal oldAmount = transaction.Amount;
            bool    isRetry   = transaction.Status == TransactionStatus.Failed;

            _logger.LogInformation(
                "Updating Transaction {Id}: OldAmount={OldAmount}₪, NewAmount={NewAmount}₪, IsRetry={IsRetry}",
                id, oldAmount, amount, isRetry);

            transaction.Amount = amount;

            if (isRetry)
            {
                string token = await _bankProvider.GetTokenAsync(transaction.PersonalId);
                BankResponse response = await _bankProvider.ExecuteTransactionAsync(token, new Transaction
                {
                    AccountNumber = transaction.AccountNumber,
                    ActionType    = transaction.ActionType,
                    Amount        = amount,
                });

                transaction.Status          = response.IsSuccess ? TransactionStatus.Success : TransactionStatus.Failed;
                transaction.FailureReason   = response.IsSuccess ? null : response.FailureReason;
                transaction.TransactionDate = DateTime.UtcNow;
                _dbContext.Entry(transaction).Property(t => t.TransactionDate).IsModified = true;

                if (transaction.Status == TransactionStatus.Success)
                    _logger.LogInformation(
                        "Retry for Transaction {Id} completed with status Success", id);
                else
                    _logger.LogWarning(
                        "[SIMULATED] Retry for Transaction {Id} declined by provider — reason: {FailureReason}",
                        id, transaction.FailureReason);
            }

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Transaction {Id} updated successfully (Amount: {OldAmount}₪ → {NewAmount}₪)",
                id, oldAmount, amount);

            return transaction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[TECHNICAL] Unexpected error while updating Transaction {Id}", id);
            throw;
        }
    }

    public async Task<bool> DeleteTransactionAsync(int id)
    {
        try
        {
            var transaction = await _dbContext.Transactions.FindAsync(id);
            if (transaction is null)
            {
                _logger.LogWarning("Delete requested for non-existent transaction {Id}", id);
                return false;
            }

            _dbContext.Transactions.Remove(transaction);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Transaction {Id} ({ActionType}, {Amount}₪) deleted from the system",
                transaction.Id, transaction.ActionType, transaction.Amount);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[TECHNICAL] Unexpected error while deleting Transaction {Id}", id);
            throw;
        }
    }
}
