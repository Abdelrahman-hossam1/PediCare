`use client`

type GreetingProps = {
  name: string;
  role: string;}

export function Greeting({ name, role }: GreetingProps) {
  return (
    <div>
      <h1 className="text-lg font-medium">Hello {name}!</h1>
      <p className="text-sm text-muted-foreground">You are logged in as a {role}.</p>
    </div>
  );
}