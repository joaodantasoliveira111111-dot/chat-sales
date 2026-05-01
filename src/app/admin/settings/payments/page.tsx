import { AdminLayout } from "@/components/admin/AdminLayout";
import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";

export default function PaymentSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Configuracao de pagamentos</h1>
          <p className="text-sm text-[#A9B4C3]">
            Camada generica paymentProvider pronta para PixUp, SuitPay, HorsePay,
            Mercado Pago ou outro gateway.
          </p>
        </div>
        <PaymentSettingsForm />
      </div>
    </AdminLayout>
  );
}
