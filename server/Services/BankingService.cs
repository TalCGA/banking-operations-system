using BankingSystem.Data;
using BankingSystem.Models;
using BankingSystem.Providers;
using Microsoft.EntityFrameworkCore;

namespace BankingSystem.Services;

public class BankingService
{
    private readonly IBankProvider _bankProvider;
    private readonly BankingDbContext _dbContext;

    public BankingService(IBankProvider bankProvider, BankingDbContext dbContext)
    {
        _bankProvider = bankProvider;
        _dbContext = dbContext;
    }

    public async Task<Transaction> ProcessTransactionAsync(TransactionRequest request)
    {
        string token = await _bankProvider.GetTokenAsync(request.PersonalId, request.AccountNumber);

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

        return transaction;
    }

    public async Task<List<Transaction>> GetAllTransactionsAsync()
    {
        return await _dbContext.Transactions
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync();
    }
}
