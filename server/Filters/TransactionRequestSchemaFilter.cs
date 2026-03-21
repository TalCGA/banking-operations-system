using System.Text.Json.Nodes;
using BankingSystem.Models;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace BankingSystem.Filters;

public class TransactionRequestSchemaFilter : ISchemaFilter
{
    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type != typeof(TransactionRequest)) return;

        // IOpenApiSchema.Example is read-only on the interface; cast to the concrete type to set it.
        if (schema is not OpenApiSchema concreteSchema) return;

        concreteSchema.Example = JsonNode.Parse("""
            {
                "fullNameHebrew":  "ישראל ישראלי",
                "fullNameEnglish": "Israel Israeli",
                "birthDate":       "1990-05-15",
                "personalId":      "123456789",
                "amount":          1500.00,
                "accountNumber":   "1234567890",
                "actionType":      "Deposit"
            }
            """);
    }
}
