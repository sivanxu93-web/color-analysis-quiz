import {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials';
import { OAuth2Client } from 'google-auth-library';
import {checkAndSaveUser, getUserByEmail} from "~/servers/user";
import {headers} from "next/headers";

const googleAuthClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET_ID!,
      httpOptions: {
        timeout: 10000,
      }
    }),
    // connect with google api internally
    CredentialsProvider({
      // We will use this id later to specify for what Provider we want to trigger the signIn method
      id: "googleonetap",
      name: "google-one-tap",
      // This means that the authentication will be done through a single credential called 'credential'
      credentials: {
        credential: { type: "text" },
      },
              // @ts-ignore
            authorize: async (credentials) => {
              const token = credentials!.credential;
              const ticket = await googleAuthClient.verifyIdToken({
                idToken: token,
                audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              });
      
              const payload = ticket.getPayload();
              if (!payload) {
                throw new Error("Cannot extract payload from signin token");
              }
              const { email, name, picture: image, sub } = payload;
              if (!email) {
                throw new Error("Email not available");
              }
              const user = {id: sub, email, name, image}
              
              try {
                  await checkAndSaveUser(user.name!, user.email, user.image!, 'unknown');
              } catch (e) {
                  console.error("Authorize DB Error:", e);
              }
              return user
            }
          }),
          // DEV ONLY: Direct Login
          CredentialsProvider({
              id: "dev-login",
              name: "Dev Direct Login",
              credentials: {
                  email: { label: "Email", type: "text", placeholder: "test@example.com" }
              },
              async authorize(credentials) {
                  if (process.env.NODE_ENV !== 'development') {
                      return null;
                  }
                  const email = credentials?.email;
                  if (!email) return null;
      
                  const user = {
                      id: email, // Use email as mock ID for dev
                      email: email,
                      name: "Dev User",
                      image: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                  };
      
                  try {
                      await checkAndSaveUser(user.name, user.email, user.image, 'unknown');
                  } catch (e) {
                      console.error("Dev Login DB Error:", e);
                  }
                  return user;
              }
          })  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug
  callbacks: {
    async signIn({user, account, profile, email, credentials}) {
      try {
          await checkAndSaveUser(user.name!, user.email!, user.image!, 'unknown');
          return true;
      } catch (e) {
          console.error("SignIn DB Error:", e);
          return false;
      }
    },
    async redirect({url, baseUrl}) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({session}) {
      if (session) {
        const email = session?.user?.email;
        if (email) {
          // @ts-ignore
          session.user = await getUserByEmail(email);
          return session;
        }
      }
      return session;
    }
  }
};
