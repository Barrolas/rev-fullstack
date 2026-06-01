package cl.duocuc.rev.bff.dto;

import lombok.Data;

@Data
public class RegisterCiudadanoRequest {

    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String rut;
}
