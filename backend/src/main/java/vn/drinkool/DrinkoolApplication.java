package vn.drinkool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DrinkoolApplication {

    public static void main(String[] args) {
        SpringApplication.run(DrinkoolApplication.class, args);
    }
}
