package logging_middleware;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LogFilter {

    public void logRequest(String method, String url) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        System.out.printf("[%s] INFO: Request -> Method: %s | URL: %s\n", timestamp, method, url);
    }

    public void logResponse(String url, int status) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        System.out.printf("[%s] INFO: Response <- URL: %s | Status: %d\n", timestamp, url, status);
    }
}
