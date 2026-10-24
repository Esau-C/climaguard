
using ClimaGuard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ClimaGuard.API.Data
{
    public class ClimaGuardDbContext : DbContext
    {
        public ClimaGuardDbContext(
            DbContextOptions<ClimaGuardDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Comunidad> Comunidades => Set<Comunidad>();
        public DbSet<Sensor> Sensores => Set<Sensor>();
        public DbSet<Lectura> Lecturas => Set<Lectura>();
        public DbSet<Alerta> Alertas => Set<Alerta>();
        public DbSet<Evento> Eventos => Set<Evento>();
        public DbSet<Bitacora> Bitacoras => Set<Bitacora>();

        // reglas de alerta configurables
        public DbSet<ReglaAlerta> ReglasAlerta => Set<ReglaAlerta>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // username unico
            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // codigo de sensor unico
            modelBuilder.Entity<Sensor>()
                .HasIndex(s => s.Codigo)
                .IsUnique();

            // comunidad 1 -> n sensores
            modelBuilder.Entity<Comunidad>()
                .HasMany(c => c.Sensores)
                .WithOne(s => s.Comunidad)
                .HasForeignKey(s => s.IdComunidad)
                .OnDelete(DeleteBehavior.Restrict);

            // sensor 1 -> n lecturas
            modelBuilder.Entity<Sensor>()
                .HasMany(s => s.Lecturas)
                .WithOne(l => l.Sensor)
                .HasForeignKey(l => l.IdSensor);

            // alerta -> sensor
            modelBuilder.Entity<Alerta>()
                .HasOne(a => a.Sensor)
                .WithMany()
                .HasForeignKey(a => a.IdSensor)
                .OnDelete(DeleteBehavior.Restrict);

            // alerta -> lectura
            modelBuilder.Entity<Alerta>()
                .HasOne(a => a.Lectura)
                .WithMany()
                .HasForeignKey(a => a.IdLectura)
                .OnDelete(DeleteBehavior.Restrict);

            // evento -> alerta
            modelBuilder.Entity<Evento>()
                .HasOne(e => e.Alerta)
                .WithMany()
                .HasForeignKey(e => e.IdAlerta)
                .OnDelete(DeleteBehavior.Restrict);

            // evento -> sensor
            modelBuilder.Entity<Evento>()
                .HasOne(e => e.Sensor)
                .WithMany()
                .HasForeignKey(e => e.IdSensor)
                .OnDelete(DeleteBehavior.Restrict);

            // bitacora -> usuario
            modelBuilder.Entity<Bitacora>()
                .HasOne(b => b.Usuario)
                .WithMany()
                .HasForeignKey(b => b.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);

            // indice para consultar reglas por fenomeno y nivel
            modelBuilder.Entity<ReglaAlerta>()
                .HasIndex(r => new
                {
                    r.TipoFenomeno,
                    r.Nivel,
                    r.Activa
                });
        }
    }
}
