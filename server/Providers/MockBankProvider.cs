using System.Text;
using System.Text.Json;
using BankingSystem.Configuration;
using BankingSystem.Models;
using Microsoft.Extensions.Options;

namespace BankingSystem.Providers;

public class MockBankProvider : IBankProvider
{
    private static readonly Random   _random         = new();
    private static readonly string[] _failureReasons = ["Timeout", "Insufficient Funds", "System Error"];

    private readonly IHttpClientFactory  _httpClientFactory;
    private readonly OpenBankingOptions  _openBankingOptions;

    public MockBankProvider(IHttpClientFactory httpClientFactory, IOptions<OpenBankingOptions> openBankingOptions)
    {
        _httpClientFactory  = httpClientFactory;
        _openBankingOptions = openBankingOptions.Value;
    }

    public async Task<string> GetTokenAsync(string userId, string secretId)
    {
        var requestPayload = JsonSerializer.Serialize(new { userId, secretId });
        await SendPostRequestAsync(_openBankingOptions.CreateTokenUrl, requestPayload);

        await Task.Delay(500);
        return Guid.NewGuid().ToString();
    }

    public async Task<BankResponse> ExecuteTransactionAsync(string token, Transaction transaction)
    {
        string targetUrl = transaction.ActionType == ActionType.Deposit
            ? _openBankingOptions.DepositUrl
            : _openBankingOptions.WithdrawUrl;

        var requestPayload = JsonSerializer.Serialize(new
        {
            token,
            accountNumber = transaction.AccountNumber,
            amount        = transaction.Amount,
            actionType    = transaction.ActionType.ToString()
        });

        await SendPostRequestAsync(targetUrl, requestPayload);

        await Task.Delay(500);

        bool isSuccess = _random.NextDouble() < 0.80;

        return new BankResponse
        {
            IsSuccess     = isSuccess,
            FailureReason = isSuccess ? null : _failureReasons[_random.Next(_failureReasons.Length)]
        };
    }

    private async Task SendPostRequestAsync(string url, string jsonPayload)
    {
        var httpClient      = _httpClientFactory.CreateClient("OpenBanking");
        var requestContent  = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        try
        {
            await httpClient.PostAsync(url, requestContent);
        }
        catch
        {
            // Expected failure due to mock URLs; continuing with simulated response as per requirements.
        }
    }
}
