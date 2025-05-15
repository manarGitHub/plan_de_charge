import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminDeleteUserCommand, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Manager, User } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';


const client = new CognitoIdentityProviderClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken:process.env.AWS_SESSION_TOKEN!
  }
});

export const createCognitoUser = async (username:string,email: string, role: string, tempPassword: string) => {
  const generatedUsername = `user_${uuidv4()}`;

  const command = new AdminCreateUserCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID!,
    Username: username, // Use generated username instead of email
    TemporaryPassword: tempPassword,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
      { Name: 'custom:role', Value: role },
      { Name: 'preferred_username', Value: username },

    ],
    MessageAction: 'SUPPRESS'
  });

  const response = await client.send(command);
  return response.User?.Attributes?.find(attr => attr.Name === 'sub')?.Value;
};

export const deleteCognitoUser = async (email: string) => {
  const command = new AdminDeleteUserCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID!,
    Username: email
  });

  await client.send(command);
};
export const getCognitoRole = async (email: string): Promise<string | null | undefined> => {
  // Add validation
  if (!email) {
    console.error('Empty email provided');
    return undefined;
  }

  try {
    const command = new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: email
    });

    const response = await client.send(command);
    return response.UserAttributes?.find(attr => attr.Name === 'custom:role')?.Value || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'UserNotFoundException') {
      return undefined;
    }
    console.error(`Error getting role for ${email}:`, error);
    return null;
  }
};

export const enrichWithCognitoRoles = async <T extends User | Manager>(
  records: T[],
  defaultRole: string
): Promise<(T & { role: string })[]> => {
  return Promise.all(
    records.map(async (record) => {
      // Validate email exists
       if (!record.email) {
        if ('userId' in record) {
          console.error('Missing email in user:', record.userId);
        } else {
          console.error('Missing email in manager:', record.id);
        }
        return { ...record, role: defaultRole };
      }
      
      return {
        ...record,
        role: (await getCognitoRole(record.email)) || defaultRole
      };
    })
  );
};