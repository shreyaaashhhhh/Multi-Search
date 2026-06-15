package mth.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
	  @Value("${app.jwt.secret}")
	  private String secretKey;

	  private SecretKey getKey() {
	    return Keys.hmacShaKeyFor(secretKey.getBytes());
	  }

	  public Object generateJWT(Object username, Object role) throws Exception
	  {
	    return generateJWT(username, role, null);
	  }
	  public Object generateJWT(Object username, Object role, Object crid) throws Exception
	  {
	    Map<String, Object> payload = new HashMap<>();
	    payload.put("username", username);
	    payload.put("role", role);
	    if(crid != null)
	      payload.put("crid", crid);
	    return Jwts.builder()
	        .claims(payload)
	        .issuedAt(new Date())
	        .expiration(new Date(new Date().getTime() + 86400000))
	        .signWith(getKey())    
	        .compact();
	  }
	  public Map<String, Object> validateJWT(String token)throws Exception
	  {
	    Claims claims = Jwts.parser()
	              .verifyWith(getKey())
	              .build()
	              .parseSignedClaims(token)
	              .getPayload();
	    Date expiration = claims.getExpiration();
	    Map<String, Object> payload  = new HashMap<>();
	    if(expiration == null || expiration.before(new Date()))
	      throw new Exception("Invalid Token!");
	    payload.put("username", claims.get("username"));
	    payload.put("role", claims.get("role"));
	    payload.put("crid", claims.get("crid"));
	    return payload;
	  }   }
