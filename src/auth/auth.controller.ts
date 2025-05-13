import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { CurrentUser } from "./decorators/current-user.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { RefreshAuthGuard } from "./guards/refresh-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Sign up a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 409, description: "User already exists" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @Post()
  signup(@Body() signupDto: CreateUserDto) {
    return this.authService.signup(signupDto);
  }

  @ApiOperation({ summary: "Login a user" })
  @ApiResponse({ status: 200, description: "User logged in successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @UseGuards(LocalAuthGuard)
  @Post("/login")
  login(@Req() req) {
    const { id } = req.user;
    return this.authService.login(id);
  }

  @ApiOperation({ summary: "Refresh authentication tokens" })
  @ApiResponse({ status: 200, description: "Tokens refreshed successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @UseGuards(RefreshAuthGuard)
  @Post("refresh")
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @ApiOperation({ summary: "Logout a user" })
  @ApiResponse({ status: 200, description: "User logged out successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user) {
    return this.authService.logout(user.id);
  }
}
