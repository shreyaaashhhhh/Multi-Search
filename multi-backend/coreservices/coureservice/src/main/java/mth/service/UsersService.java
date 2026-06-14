package mth.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import mth.models.Menus;
import mth.models.Users;
import mth.repository.UsersRepository;

@Service
public class UsersService {

	@Autowired
	UsersRepository UR;
	
	@Autowired
	JwtService JWT;

	private void authorizeStoreStaff(String token) throws Exception {
		Map<String, Object> payload = JWT.validateJWT(token);
		Number role = (Number) payload.get("role");
		if(role == null)
			throw new Exception("Access denied for this store account");
		if(role.longValue() > 1)
			return;
		List<Object> menus = UR.getMenus(role.longValue());
		boolean hasCustomerAccess = menus.stream().anyMatch(menu -> {
			String label = menu instanceof Menus ? ((Menus) menu).getMenu() : String.valueOf(menu);
			String normalized = label.toLowerCase().replaceAll("[^a-z0-9]", "");
			return normalized.contains("user") ||
					normalized.contains("customer") ||
					normalized.contains("admin") ||
					normalized.contains("seller");
		});
		if(!hasCustomerAccess)
			throw new Exception("Access denied for this store account");
	}

	public Object signup(Users U)
	  {
	    Map<String, Object> response = new HashMap<>();
	    try
	    {
	      Object id = UR.checkByEmail(U.getEmail());
	      if(id != null)
	      {        
	        response.put("code", 501);
	        response.put("message", "Email ID already registered");
	      }
	      else
	      {
	        U.setRole(1);    //Setting default role to the new user
	        U.setStatus(1);    //Make the status of the user as active
	        
	        UR.save(U);      //Insert into the database table (users)
	        
	        response.put("code", 200);
	        response.put("message", "User account has been created.");
	      }
	    }catch(Exception e)
	    {
	      response.put("code", 500);
	      response.put("message", e.getMessage());
	    }
	    return response;
	  }
	public Object signin(Map<String,Object> data) {
		Map<String,Object> response = new HashMap<>();
		
		try {
			Object role = UR.validateCredentials(data.get("username").toString(),
					data.get("password").toString()); //validate user name and password
			if(role != null) {
				Users user = (Users) UR.findByEmail(data.get("username").toString());
				response.put("code", 200);
				response.put("jwt", JWT.generateJWT(data.get("username"), role, user.getId())); //Generate JWT
			}
			else {
				response.put("code",404);
				response.put("message", "Invalid Credentials!");
				
			}
					
		} catch(Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	public Object uinfo(String token)
    {
        Map<String, Object> response = new HashMap<>();
        try
        {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = (String) payload.get("username");
            Users U = (Users) UR.findByEmail(email);

            List<Object>menuList = UR.getMenus(Long.valueOf(U.getRole()));

            response.put("code", 200);
            response.put("id", U.getId());
            response.put("fullname", U.getFullname());
            response.put("menuList",menuList);
        }catch(Exception e)
        {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }
	
	public Object getProfile(String token)
	  {
	    Map<String, Object> response = new HashMap<>();
	    try
	    {
	      Map<String, Object> payload = JWT.validateJWT(token);
	          String email = (String) payload.get("username");
	          Object user = UR.profileByEmail(email);
	      
	          response.put("code", 200);
	          response.put("user", user);
	    }catch(Exception e)
	    {
	      response.put("code", 500);
	      response.put("message", e.getMessage());
	    }
	    return response;
	  }

	public Object getAllUsers(int page, int size, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			authorizeStoreStaff(token);
			Pageable pageable = PageRequest.of(page -1,  size);
			Page<Users> users = UR.findAll(pageable);
			response.put("code", 200);
			response.put("page", page);
			response.put("size", size);
			response.put("totalpages", users.getTotalPages());
			response.put("users", users.getContent());
			
			
		} catch(Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
		
	}
	
	 public Object saveUser(Users U, String token)
	 {
		 Map<String,Object>response = new HashMap<>();
		 try
	        {
			 authorizeStoreStaff(token);
				Object id=UR.checkByEmail(U.getEmail());
				if(id!=null)
					throw new Exception("Email ID already registered");
				UR.save(U);
				response.put("code", 200);
				response.put("message","new user account has been created .");
	  
	        }catch(Exception e)
	        {
	            response.put("code", 500);
	            response.put("message", e.getMessage());
	        }
	        return response; 
	 }
	 public Object deleteuser( Long id,String token) {
		 Map<String, Object> response = new HashMap<>();
		 try {
			 authorizeStoreStaff(token);
			 UR.deleteById(id);
			 response.put("code",200);
			 response.put("message", "user has been deleted");
			 
		 } catch(Exception e) {
			 response.put("code",  500);
			 response.put("message", e.getMessage());
		 }
		 return response;
	 }
	 public Object getUserById(Long id, String token)
	  {
	    Map<String, Object> response = new HashMap<>();
	    try
	    {
	      authorizeStoreStaff(token); //Authorization
	      Users user = UR.findById(id).get();
	      
	          response.put("code", 200);
	          response.put("user", user);
	    }catch(Exception e)
	    {
	      response.put("code", 500);
	      response.put("message", e.getMessage());
	    }
	    return response;
	  }
}
