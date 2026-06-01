package cl.duocuc.rev.gateway.filter;

import java.net.InetSocketAddress;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Component
public class PublicRateLimitFilter extends AbstractGatewayFilterFactory<PublicRateLimitFilter.Config> {

    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    public PublicRateLimitFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String clientIp = resolveClientIp(exchange.getRequest().getHeaders().getFirst("X-Forwarded-For"));
            if (clientIp == null) {
                InetSocketAddress remote = exchange.getRequest().getRemoteAddress();
                clientIp = remote != null ? remote.getAddress().getHostAddress() : "unknown";
            }

            WindowCounter counter = counters.computeIfAbsent(clientIp, key -> new WindowCounter());
            if (!counter.tryConsume(config.getMaxRequests(), config.getWindowSeconds())) {
                log.warn("Rate limit publico excedido para IP efimera");
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Demasiados reportes. Intente mas tarde.");
            }
            return chain.filter(exchange);
        };
    }

    private static String resolveClientIp(String forwardedFor) {
        if (forwardedFor == null || forwardedFor.isBlank()) {
            return null;
        }
        return forwardedFor.split(",")[0].trim();
    }

    public static class Config {
        private int maxRequests = 5;
        private long windowSeconds = 3600;

        public int getMaxRequests() {
            return maxRequests;
        }

        public void setMaxRequests(int maxRequests) {
            this.maxRequests = maxRequests;
        }

        public long getWindowSeconds() {
            return windowSeconds;
        }

        public void setWindowSeconds(long windowSeconds) {
            this.windowSeconds = windowSeconds;
        }
    }

    private static final class WindowCounter {
        private long windowStartEpochSec;
        private int count;

        synchronized boolean tryConsume(int maxRequests, long windowSeconds) {
            long now = Instant.now().getEpochSecond();
            if (windowStartEpochSec == 0 || now - windowStartEpochSec >= windowSeconds) {
                windowStartEpochSec = now;
                count = 0;
            }
            if (count >= maxRequests) {
                return false;
            }
            count++;
            return true;
        }
    }
}
