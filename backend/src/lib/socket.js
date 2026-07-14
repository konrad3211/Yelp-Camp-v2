import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  //to middleware dla połączeń socketowych.
  //Jest podobny do Expressowego: router.get("/", protect, controller);
  // Tylko tutaj zamiast:req res next mamy socket next
  //Każdy użytkownik musi przejść przez ten middleware, zanim wykona się: io.on("connection", ...)
  io.use(async (socket, next) => {
    try {
      //pobieramy access token, we forncie to bedzie wygladac +/-
      //const socket = io(API_URL, {
      //   auth: {
      //     token: accessToken,
      //   },
      // });
      //i backend odbiera ten token socket.handshake.auth.token;
      //to pobiera accessToken a fronta, ktory wczesniej pobral z backnedu accesstoken
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired access token"));
    }
  });
  //Ten kod wykona się tylko wtedy, gdy middleware io.use() zakończy się: next()
  //Czyli użytkownik: przesłał token, token był prawidłowy, konto istnieje.
  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    //Użytkownik dołącza do własnego pokoju
    //pokój użytkownika działa bardziej jak jego prywatna skrzynka realtime. Backend może do niej wysyłać eventy, ale inni użytkownicy nie muszą i nie powinni do niej dołączać.
    //dzieki temu ze pokoj jest podpisany userId mozemy polaczyc sie z roznych urzadzen np tel, pc, dwie karty przegladarki bedziemy miec kilka socketow, ale w tym samym pokoju, wiec bedziemy miec wszystko live na kazdym urzadzeniu.
    //*Socket to aktywne połączenie między klientem a serwerem, które pozostaje otwarte i pozwala obu stronom wysyłać dane w dowolnym momencie.
    //Najprościej: Socket to stały kanał komunikacji między przeglądarką lub aplikacją a serwerem.
    //Socket to stale otwarte połączenie między klientem, np. frontendem, a serwerem.
    //Sam socket może:
    // wysyłać eventy,
    // odbierać eventy,
    // dołączać do pokojów,
    // opuszczać pokoje.
    socket.join(`user:${userId}`);

    //Logujesz połączenie
    //To tylko log pomocniczy.
    console.log(`User connected ${userId}`);

    //Obsługujesz rozłączenie
    //     Ten event wykona się, gdy użytkownik:
    // zamknie kartę,
    // straci internet,
    // odświeży stronę,
    // ręcznie rozłączy socket,
    // serwer zerwie połączenie
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
  //   Zwracasz io
  //   Dzięki temu w index.js możesz zrobić: const io = initializeSocket(httpServer);
  //   A potem: app.set("io", io);
  //   W kontrolerze: const io = req.app.get("io");
  // i możesz emitować eventy po zapisaniu wiadomości.
  return io;
};
