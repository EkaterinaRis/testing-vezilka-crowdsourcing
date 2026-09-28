package mk.ukim.vezilka.backend.bootstrap;

import mk.ukim.vezilka.backend.model.Dialect;
import mk.ukim.vezilka.backend.repository.DialectRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DialectSeeder implements CommandLineRunner {

    private final DialectRepository dialectRepository;

    public DialectSeeder(DialectRepository dialectRepository) {
        this.dialectRepository = dialectRepository;
    }

    @Override
    public void run(String... args) {
        // Западни дијалекти
        seed("Западни дијалекти", "Прилепско-битолски");
        seed("Западни дијалекти", "Охридско-преспански");
        seed("Западни дијалекти", "Тетовски");
        seed("Западни дијалекти", "Гостиварски");
        seed("Западни дијалекти", "Дебарски");

        // Источни дијалекти
        seed("Источни дијалекти", "Штипско-струмички");
        seed("Источни дијалекти", "Малешевско-пирински");
        seed("Источни дијалекти", "Кочанско-винички");
        seed("Источни дијалекти", "Гевгелиски");
        seed("Западни дијалекти", "Велешки");

        // Северни дијалекти
        seed("Северни дијалекти", "Кумановски");
        seed("Северни дијалекти", "Скопски");
        seed("Северни дијалекти", "Кривопаланечки");

        // Стандардни дијалекти
        seed("Стандардни дијалекти", "Литературен јазик");
    }

    private void seed(String region, String name) {
        if (!dialectRepository.existsByName(name)) {
            Dialect dialect = new Dialect();
            dialect.setRegion(region);
            dialect.setName(name);

            dialectRepository.save(dialect);
        }
    }
}