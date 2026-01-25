package com.offficeVerse.util;

import java.io.FileWriter;
import java.io.IOException;


public class FileLogger {


    public static synchronized void log(String file, String message) {
        try (FileWriter fw = new FileWriter("data/logs/" + file, true)) {
            fw.write(message + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
