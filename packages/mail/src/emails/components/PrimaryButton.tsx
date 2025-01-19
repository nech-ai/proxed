import { Button } from "@react-email/components";

export default function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      href={href}
      className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
    >
      {children}
    </Button>
  );
}
