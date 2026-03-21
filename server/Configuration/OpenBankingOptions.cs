namespace BankingSystem.Configuration;

public class OpenBankingOptions
{
    public const string SectionName = "OpenBankingOptions";

    public string CreateTokenUrl { get; set; } = string.Empty;
    public string DepositUrl     { get; set; } = string.Empty;
    public string WithdrawUrl    { get; set; } = string.Empty;
}
