export function omitUser<User extends Record<string, any>, Key extends keyof User>(
   user: User,
   ...keys: Key[]
): Omit<User, Key> {
   const clone = { ...user }
   for (const key of keys) {
      delete clone[key]
   }
   return clone
}
