import { useState } from "react"
import { FileTextIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { DatePickerInput } from "@/components/date-picker-input"
import ErrorMessage, { type ActionState } from "@/components/error-message"
import { NotificationsBell } from "@/components/notifications-bell"
import { useToastNotifications } from "@/hooks/use-toast-notifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Invoice, InvoiceStatus } from "@/services/invoices/invoices.service"
import {
  useCreateInvoice,
  useInvoices,
  useRemoveInvoice,
  useUpdateInvoice,
} from "@/services/invoices/invoices.service"
import { CreateInvoiceSchema } from "../../schema"

const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDIENTE: { label: "Pendiente", variant: "outline" },
  VENCIDA: { label: "Vencida", variant: "destructive" },
  PAGADA: { label: "Pagada", variant: "secondary" },
}

export function InvoicesPage() {
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const invoicesQuery = useInvoices()

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <h1 className="truncate text-lg font-semibold">Facturas</h1>
                <p className="truncate text-sm text-muted-foreground">
                  Consulta y administra el estado de tus facturas
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <NotificationsBell />
                <Button
                  aria-label="Crear factura"
                  className="size-8 px-0 sm:size-auto sm:h-8 sm:px-2.5"
                  onClick={() => {
                    setEditingInvoice(null)
                    setShowCreateInvoice((value) => !value)
                  }}
                >
                  <PlusIcon data-icon="inline-start" />
                  <span className="hidden sm:inline">Crear factura</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-5 bg-muted/35 p-4 md:p-6">
            {showCreateInvoice ? (
              <CreateInvoiceCard
                key={editingInvoice?.id ?? "new-invoice"}
                invoice={editingInvoice}
                onDone={() => {
                  setEditingInvoice(null)
                  setShowCreateInvoice(false)
                }}
              />
            ) : null}

            <div className="grid gap-3 md:hidden">
              {invoicesQuery.isLoading ? (
                <MobileMessage>Cargando facturas...</MobileMessage>
              ) : null}
              {invoicesQuery.isError ? (
                <MobileMessage>No se pudieron cargar las facturas desde la API.</MobileMessage>
              ) : null}
              {invoicesQuery.data?.length ? (
                invoicesQuery.data.map((invoice) => (
                  <InvoiceMobileCard
                    key={invoice.id}
                    invoice={invoice}
                    onEdit={(nextInvoice) => {
                      setEditingInvoice(nextInvoice)
                      setShowCreateInvoice(true)
                    }}
                  />
                ))
              ) : null}
              {invoicesQuery.data?.length === 0 ? (
                <MobileMessage>No hay facturas registradas.</MobileMessage>
              ) : null}
            </div>

            <Card className="hidden rounded-2xl bg-card py-0 md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Factura
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Concepto
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Estado
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Vencimiento
                      </TableHead>
                      <TableHead className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Monto
                      </TableHead>
                      <TableHead className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesQuery.isLoading ? (
                      <TableMessage>Cargando facturas...</TableMessage>
                    ) : null}
                    {invoicesQuery.isError ? (
                      <TableMessage>No se pudieron cargar las facturas desde la API.</TableMessage>
                    ) : null}
                    {invoicesQuery.data?.length ? (
                      invoicesQuery.data.map((invoice) => (
                        <InvoiceRow
                          key={invoice.id}
                          invoice={invoice}
                          onEdit={(nextInvoice) => {
                            setEditingInvoice(nextInvoice)
                            setShowCreateInvoice(true)
                          }}
                        />
                      ))
                    ) : null}
                    {invoicesQuery.data?.length === 0 ? (
                      <TableMessage>No hay facturas registradas.</TableMessage>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function InvoiceRow({
  invoice,
  onEdit,
}: {
  invoice: Invoice
  onEdit: (invoice: Invoice) => void
}) {
  const status = statusConfig[invoice.status]

  return (
    <TableRow>
      <TableCell className="px-4 py-5 font-mono text-xs font-semibold text-muted-foreground">
        {invoice.id}
      </TableCell>
      <TableCell className="px-4 py-5 font-semibold">{invoice.concept}</TableCell>
      <TableCell className="px-4 py-5">
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell className="px-4 py-5 text-muted-foreground">
        {formatDate(invoice.dueDate)}
      </TableCell>
      <TableCell className="px-4 py-5 text-right font-semibold tabular-nums">
        {formatCurrency(invoice.amount)}
      </TableCell>
      <TableCell className="px-4 py-5 text-right">
        <InvoiceActions invoice={invoice} onEdit={onEdit} />
      </TableCell>
    </TableRow>
  )
}

function InvoiceMobileCard({
  invoice,
  onEdit,
}: {
  invoice: Invoice
  onEdit: (invoice: Invoice) => void
}) {
  const status = statusConfig[invoice.status]

  return (
    <Card className="rounded-2xl py-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="font-mono text-sm font-medium text-muted-foreground">
              {invoice.id}
            </p>
            <h2 className="line-clamp-2 text-base font-semibold leading-snug">
              {invoice.concept}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Badge variant={status.variant}>{status.label}</Badge>
            <InvoiceActions invoice={invoice} onEdit={onEdit} />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <span>Vence {formatDate(invoice.dueDate)}</span>
          </div>
          <p className="text-base font-semibold tabular-nums">
            {formatCurrency(invoice.amount)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function InvoiceActions({
  invoice,
  onEdit,
}: {
  invoice: Invoice
  onEdit: (invoice: Invoice) => void
}) {
  const removeInvoice = useRemoveInvoice()
  const { notifyDeleted, notifyError } = useToastNotifications("invoice")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Abrir acciones">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(invoice)}>
          <PencilIcon />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={removeInvoice.isPending}
          onClick={() =>
            removeInvoice.mutate(invoice.id, {
              onSuccess: notifyDeleted,
              onError: () => notifyError("eliminar"),
            })
          }
        >
          <Trash2Icon />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateInvoiceCard({
  invoice,
  onDone,
}: {
  invoice: Invoice | null
  onDone: () => void
}) {
  const [concept, setConcept] = useState(invoice?.concept ?? "")
  const [amount, setAmount] = useState(invoice ? String(invoice.amount) : "")
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "PENDIENTE")
  const [dueDate, setDueDate] = useState(toDateInputValue(invoice?.dueDate))
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()
  const { notifyCreated, notifyUpdated, notifyError } = useToastNotifications("invoice")
  const [actionState, setActionState] = useState<ActionState>({})
  const isPending = createInvoice.isPending || updateInvoice.isPending

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = CreateInvoiceSchema.safeParse({
      concept,
      amount,
      status,
      dueDate,
    })

    if (!result.success) {
      setActionState({
        succeeded: false,
        message: result.error.issues[0]?.message ?? "Revisa los datos de la factura",
        title: "Validación del formulario",
      })
      return
    }

    if (invoice) {
      updateInvoice.mutate(
        { id: invoice.id, input: result.data },
        {
          onSuccess: () => {
            notifyUpdated()
            setTimeout(onDone, 300)
          },
          onError: () => notifyError("actualizar"),
        }
      )
      return
    }

    createInvoice.mutate(result.data, {
      onSuccess: () => {
        notifyCreated()
        setTimeout(onDone, 300)
      },
      onError: () => notifyError("crear"),
    })
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{invoice ? "Editar factura" : "Crear factura"}</CardTitle>
        <CardDescription>
          {invoice
            ? "Actualiza los datos principales de la factura."
            : "Registra una factura asociada a tu cuenta."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorMessage state={actionState} />
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="invoice-concept">Concepto</Label>
            <Input
              id="invoice-concept"
              placeholder="Ej. Desarrollo Frontend Q2"
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invoice-amount">Monto</Label>
            <Input
              id="invoice-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="3200"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Estado</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as InvoiceStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="VENCIDA">Vencida</SelectItem>
                  <SelectItem value="PAGADA">Pagada</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DatePickerInput
            id="invoice-due-date"
            label="Fecha límite"
            value={dueDate}
            onChange={setDueDate}
            required
          />
          <div className="flex items-end justify-end gap-2 md:col-span-2">
            <Button variant="outline" type="button" onClick={onDone}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <FileTextIcon data-icon="inline-start" />
              {isPending ? "Guardando..." : "Guardar factura"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function TableMessage({ children }: { children: React.ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  )
}

function MobileMessage({ children }: { children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl py-0">
      <CardContent className="p-6 text-center text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  )
}

function toDateInputValue(value: string | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : ""
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value))
}
