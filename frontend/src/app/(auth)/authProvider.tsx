"use client";

import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import {
  Authenticator,
  Heading,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, usePathname } from "next/navigation";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

const components = {
  Header() {
    return (
      <View className="mt-4 mb-7">
        <Heading level={3} className="!text-2xl !font-bold">
          Cap
          <span className="text-secondary-500 font-light hover:!text-primary-300">
            gemini
          </span>
        </Heading>
        <p className="text-muted-foreground mt-2">
          <span className="font-bold">Bienvenue !</span> Veuillez vous connecter pour continuer.
        </p>
      </View>
    );
  },
  SignIn: {
    Footer() {
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Contactez admin
          </p>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    email: {
      placeholder: "Entrez votre adresse e-mail",
      label: "E-mail",
      isRequired: true,
    },
    password: {
      placeholder: "Entrez votre mot de passe",
      label: "Mot de passe",
      isRequired: true,
    },
  },
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin)$/);
  const isDashboardPage =
    pathname.startsWith("/manager") || pathname.startsWith("/user");

  useEffect(() => {
    if (user && isAuthPage) {

      router.push("/");
    }
  }, [user, isAuthPage, router]);

  if (!isAuthPage && !isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-full">
      <Authenticator
        hideSignUp
        initialState={"signIn"}
        components={components}
        formFields={formFields}
      >
        {() => <>{children}</>}
      </Authenticator>
    </div>
  );
};

export default Auth;
