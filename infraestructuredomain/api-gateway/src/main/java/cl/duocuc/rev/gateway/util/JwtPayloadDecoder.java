package cl.duocuc.rev.gateway.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.stream.StreamSupport;

public final class JwtPayloadDecoder {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JwtPayloadDecoder() {
    }

    public static String extractSub(String token) {
        return readClaim(token, "sub");
    }

    public static String extractUsername(String token) {
        String username = readClaim(token, "preferred_username");
        return username != null ? username : readClaim(token, "username");
    }

    public static List<String> extractRoles(String token) {
        try {
            JsonNode payload = decodePayload(token);
            JsonNode realmAccess = payload.get("realm_access");
            if (realmAccess == null || !realmAccess.has("roles")) {
                return Collections.emptyList();
            }
            return StreamSupport.stream(realmAccess.get("roles").spliterator(), false)
                    .map(JsonNode::asText)
                    .filter(r -> !r.startsWith("default-roles"))
                    .toList();
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    private static String readClaim(String token, String claim) {
        try {
            JsonNode payload = decodePayload(token);
            JsonNode node = payload.get(claim);
            return node != null && !node.isNull() ? node.asText() : null;
        } catch (Exception ex) {
            return null;
        }
    }

    private static JsonNode decodePayload(String token) throws java.io.IOException {
        String[] parts = token.split("\\.");
        if (parts.length < 2) {
            throw new IllegalArgumentException("JWT invalido");
        }
        byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
        return MAPPER.readTree(new String(decoded, StandardCharsets.UTF_8));
    }
}
