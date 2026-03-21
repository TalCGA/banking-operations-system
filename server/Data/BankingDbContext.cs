using BankingSystem.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace BankingSystem.Data;

public class BankingDbContext : DbContext
{
    public BankingDbContext(DbContextOptions<BankingDbContext> options) : base(options) { }

    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(t => t.Id);

            entity.Property(t => t.BirthDate)
                  .IsRequired()
                  .HasConversion(new DateOnlyConverter());

            entity.Property(t => t.FullNameHebrew)
                  .IsRequired()
                  .HasMaxLength(20);

            entity.Property(t => t.FullNameEnglish)
                  .IsRequired()
                  .HasMaxLength(15);

            entity.Property(t => t.PersonalId)
                  .IsRequired()
                  .HasMaxLength(9);

            entity.Property(t => t.AccountNumber)
                  .IsRequired()
                  .HasMaxLength(10);

            entity.Property(t => t.Amount)
                  .IsRequired()
                  .HasColumnType("decimal(10,2)");

            entity.Property(t => t.ActionType)
                  .IsRequired()
                  .HasConversion<string>();

            entity.Property(t => t.Status)
                  .IsRequired()
                  .HasConversion<string>();

            entity.Property(t => t.TransactionDate)
                  .IsRequired()
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}

/// <summary>
/// Converts <see cref="DateOnly"/> to a <c>TEXT</c> column stored as <c>yyyy-MM-dd</c> in SQLite.
/// </summary>
public class DateOnlyConverter : ValueConverter<DateOnly, string>
{
    public DateOnlyConverter()
        : base(
            d => d.ToString("yyyy-MM-dd"),
            s => DateOnly.ParseExact(s, "yyyy-MM-dd"))
    { }
}
