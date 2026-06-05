package notification_app_be;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class App {

    private static final Map<String, Integer> PRIORITY_MAP = Map.of(
        "Placement", 3,
        "Result", 2,
        "Event", 1
    );

    static class Notification implements Comparable<Notification> {
        String id;
        String type;
        String message;
        String timestampStr;
        LocalDateTime timestamp;
        int weight;

        public Notification(Map<String, String> data) {
            this.id = data.get("ID");
            this.type = data.get("Type");
            this.message = data.get("Message");
            this.timestampStr = data.get("Timestamp");
            this.weight = PRIORITY_MAP.getOrDefault(this.type, 0);
            
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            this.timestamp = LocalDateTime.parse(this.timestampStr, fmt);
        }

        @Override
        public int compareTo(Notification other) {
            if (this.weight != other.weight) {
                return Integer.compare(this.weight, other.weight);
            }
            return this.timestamp.compareTo(other.timestamp);
        }
    }

    public static void main(String[] args) {
        String url = "http://4.2.24.186.213/evaluation-service/notifications";
        int limit = 10;

        System.out.println("Fetching updates from: " + url);

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

            if (res.statusCode() != 200) {
                System.out.println("API Error, status code: " + res.statusCode());
                return;
            }

            List<Map<String, String>> dataList = parseJsonSimple(res.body());
            PriorityQueue<Notification> pq = new PriorityQueue<>();

            for (Map<String, String> row : dataList) {
                Notification notif = new Notification(row);

                if (pq.size() < limit) {
                    pq.add(notif);
                } else {
                    Notification top = pq.peek();
                    if (notif.compareTo(top) > 0) {
                        pq.poll();
                        pq.add(notif);
                    }
                }
            }

            List<Notification> result = new ArrayList<>(pq);
            result.sort(Collections.reverseOrder());

            System.out.println("\n--- PRIORITY INBOX (TOP 10) ---");
            for (int i = 0; i < result.size(); i++) {
                Notification n = result.get(i);
                System.out.printf("%d. [%s] %s - %s\n", (i + 1), n.type, n.timestampStr, n.message);
            }

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    private static List<Map<String, String>> parseJsonSimple(String json) {
        List<Map<String, String>> list = new ArrayList<>();
        String[] tokens = json.split("\\{");
        
        for (String t : tokens) {
            if (!t.contains("\"ID\":")) continue;
            
            Map<String, String> m = new HashMap<>();
            m.put("ID", getVal(t, "ID"));
            m.put("Type", getVal(t, "Type"));
            m.put("Message", getVal(t, "Message"));
            m.put("Timestamp", getVal(t, "Timestamp"));
            list.add(m);
        }
        return list;
    }

    private static String getVal(String token, String key) {
        String pattern = "\"" + key + "\":";
        int idx = token.indexOf(pattern);
        if (idx == -1) return "";
        int start = token.indexOf("\"", idx + pattern.length()) + 1;
        int end = token.indexOf("\"", start);
        return token.substring(start, end);
    }
}
