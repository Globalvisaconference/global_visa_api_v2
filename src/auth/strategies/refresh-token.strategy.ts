import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { Request } from "express";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "refresh-jwt") {
  constructor(
    private readonly configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refresh"),
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  // request.user
  validate(req, payload: any) {
    console.log(
      "JWT_REFRESH_SECRET",
      this.configService.get("JWT_REFRESH_SECRET")
    );
    const userId = payload.sub;
    return this.authService.validateRefreshToken(userId);
  }
}
