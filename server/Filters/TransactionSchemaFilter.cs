using System.Text.Json.Nodes;
using BankingSystem.Models;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace BankingSystem.Filters;

public class TransactionSchemaFilter : ISchemaFilter
{
    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type != typeof(Transaction)) return;

        if (schema is not OpenApiSchema concreteSchema) return;

        concreteSchema.Example = JsonNode.Parse("""
            {
                "id":              1,
                "fullNameHebrew":  "ישראל ישראלי",
                "fullNameEnglish": "Israel Israeli",
                "birthDate":       "1990-05-15",
                "personalId":      "123456789",
                "amount":          1500.00,
                "accountNumber":   "1234567890",
                "actionType":      "Deposit",
                "status":          "Success",
                "transactionDate": "2026-03-21T12:00:00.000Z"
            }
            """);
    }
}
