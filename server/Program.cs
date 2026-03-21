using System.Text.Json.Serialization;
using BankingSystem.Configuration;
using BankingSystem.Data;
using BankingSystem.Filters;
using BankingSystem.Providers;
using BankingSystem.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddDbContext<BankingDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Banking API", Version = "v1" });

    var xmlFile = $"{typeof(Program).Assembly.GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);

    c.SchemaFilter<TransactionRequestSchemaFilter>();
    c.SchemaFilter<TransactionSchemaFilter>();

    c.UseInlineDefinitionsForEnums();
});

builder.Services.AddOptions<OpenBankingOptions>()
    .BindConfiguration(OpenBankingOptions.SectionName)
    .ValidateDataAnnotations();

builder.Services.AddHttpClient("OpenBanking", client =>
{
    client.Timeout = TimeSpan.FromSeconds(5);
});

builder.Services.AddScoped<IBankProvider, MockBankProvider>();
builder.Services.AddScoped<BankingService>();

var app = builder.Build();

app.UseCors();
// HTTPS redirect disabled for local HTTP development; re-enable when deploying behind TLS
// app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Banking API V1");
});
app.MapControllers();

app.Run();
