import AppointmentClient from "./AppointmentClient.tsx";

export const metadata = {
  alternates: {
    canonical: "/appointment",
  },
};

export default function AppointmentPage() {
  return <AppointmentClient />;
}
