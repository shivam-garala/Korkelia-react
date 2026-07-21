import AppointmentClient from "./AppointmentClient";

export const metadata = {
  alternates: {
    canonical: "/appointment",
  },
};

export default function AppointmentPage() {
  return <AppointmentClient />;
}
