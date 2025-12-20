public class RegisterViewModel
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Role { get; set; } = "User"; // Default role
    public string Password { get; set; } = null!;
}

public class LoginViewModel
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}