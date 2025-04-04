"use client"

import { 
  CreditCard, 
  Receipt, 
  Check, 
  CircleDollarSign, 
  AlertCircle, 
  Calendar,
  FileSpreadsheet,
  DownloadCloud,
  PlusCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const planosAssinatura = [
  {
    id: "free",
    nome: "Gratuito",
    preco: "R$ 0",
    periodo: "/mês",
    desc: "Perfeito para começar",
    atual: false,
    recursos: [
      "Até 3 projetos",
      "Até 5 usuários",
      "2GB de armazenamento",
      "Suporte por email",
    ],
  },
  {
    id: "essencial",
    nome: "Essencial",
    preco: "R$ 49",
    periodo: "/mês",
    desc: "Para times pequenos",
    atual: true,
    recursos: [
      "Até 10 projetos",
      "Até 20 usuários",
      "10GB de armazenamento",
      "Suporte prioritário",
      "Recursos avançados",
    ],
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "R$ 99",
    periodo: "/mês",
    desc: "Para empresas em crescimento",
    atual: false,
    recursos: [
      "Projetos ilimitados",
      "Usuários ilimitados",
      "100GB de armazenamento",
      "Suporte 24/7",
      "Recursos avançados",
      "API personalizada",
      "Integrações exclusivas",
    ],
  },
]

const faturas = [
  {
    id: "INV-001",
    data: "01/04/2023",
    valor: "R$ 49,00",
    status: "paga",
    metodo: "Cartão de Crédito",
  },
  {
    id: "INV-002",
    data: "01/03/2023",
    valor: "R$ 49,00",
    status: "paga",
    metodo: "Cartão de Crédito",
  },
  {
    id: "INV-003",
    data: "01/02/2023",
    valor: "R$ 49,00",
    status: "paga",
    metodo: "Cartão de Crédito",
  },
  {
    id: "INV-004",
    data: "01/01/2023",
    valor: "R$ 49,00",
    status: "paga",
    metodo: "Cartão de Crédito",
  },
  {
    id: "INV-005",
    data: "01/12/2022",
    valor: "R$ 49,00",
    status: "paga",
    metodo: "Cartão de Crédito",
  },
]

export function FaturamentoTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plano de Assinatura</CardTitle>
          <CardDescription>
            Gerencie seu plano de assinatura atual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {planosAssinatura.map((plano) => (
              <Card key={plano.id} className={plano.atual ? "border-blue-400 shadow-md" : ""}>
                <CardHeader className="pb-2">
                  {plano.atual && (
                    <Badge className="mb-2 self-start">Plano Atual</Badge>
                  )}
                  <CardTitle className="text-xl">{plano.nome}</CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{plano.preco}</span>
                    <span className="text-sm text-muted-foreground">{plano.periodo}</span>
                  </div>
                  <CardDescription>{plano.desc}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <ul className="space-y-2 text-sm">
                    {plano.recursos.map((recurso, i) => (
                      <li className="flex items-center" key={i}>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span>{recurso}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plano.atual ? (
                    <Button variant="outline" className="w-full">Gerenciar Plano</Button>
                  ) : (
                    <Button className="w-full">{plano.id === "free" ? "Downgrade" : "Upgrade"}</Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>
            Gerencie seus métodos de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="cartao-principal">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4" />
                  <span>Cartão de Crédito •••• 4242</span>
                  <Badge variant="outline" className="ml-2">Principal</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Titular</p>
                      <p className="text-sm text-muted-foreground">João Silva</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Validade</p>
                      <p className="text-sm text-muted-foreground">12/2025</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button variant="outline" size="sm" className="text-red-500">Remover</Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button variant="outline" className="mt-4 flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Adicionar Método de Pagamento</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Histórico de Faturas</CardTitle>
            <CardDescription>
              Veja e faça download do histórico de pagamentos.
            </CardDescription>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Exportar Todas</span>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faturas.map((fatura) => (
                <TableRow key={fatura.id}>
                  <TableCell className="font-medium">{fatura.id}</TableCell>
                  <TableCell>{fatura.data}</TableCell>
                  <TableCell>{fatura.valor}</TableCell>
                  <TableCell>
                    {fatura.status === "paga" && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Paga
                      </Badge>
                    )}
                    {fatura.status === "pendente" && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pendente
                      </Badge>
                    )}
                    {fatura.status === "cancelada" && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Cancelada
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{fatura.metodo}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <DownloadCloud className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 