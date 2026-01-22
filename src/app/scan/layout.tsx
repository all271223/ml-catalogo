import Providers from "../components/Providers";

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
