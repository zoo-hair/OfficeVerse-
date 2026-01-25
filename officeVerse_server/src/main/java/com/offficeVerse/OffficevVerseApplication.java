package com.offficeVerse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
//import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication (
        //exclude = { DataSourceAutoConfiguration.class }
)
@EnableAsync
public class OffficevVerseApplication {

    public static void main(String[] args) {
        SpringApplication.run(OffficevVerseApplication.class, args);
    }

}
