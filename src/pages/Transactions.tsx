import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useQubic } from "../context/QubicContext";

// Interfaz para transacciones
interface Transaction {
  id: string;
  sourceAddress: string;
  targetAddress: string;
  amount: string;
  tick: number;
  timestamp: Date;
  type: "transfer" | "contract" | "burn";
  status: "confirmed" | "pending";
}

// Para demo, generamos datos de ejemplo
const generateMockTransactions = (
  count: number,
  address?: string
): Transaction[] => {
  const types: Array<"transfer" | "contract" | "burn"> = [
    "transfer",
    "contract",
    "burn",
  ];
  const statuses: Array<"confirmed" | "pending"> = ["confirmed", "pending"];

  const randomAddress = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array(50)
      .fill(0)
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join("");
  };

  return Array(count)
    .fill(0)
    .map((_, index) => {
      const isOutgoing = Math.random() > 0.5;
      const source = isOutgoing ? address || randomAddress() : randomAddress();
      const target = isOutgoing ? randomAddress() : address || randomAddress();

      return {
        id: `tx-${Date.now()}-${index}`,
        sourceAddress: source,
        targetAddress: target,
        amount: (Math.random() * 1000).toFixed(0),
        tick: Math.floor(Math.random() * 100000),
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Últimos 7 días
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };
    });
};

const Transactions: React.FC = () => {
  const { identity } = useQubic();

  // Estado local
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar transacciones al montar o cuando cambia la identidad
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);

      try {
        // En una implementación real, aquí llamaríamos a la API
        // Pero por ahora, usamos datos de ejemplo
        const mockData = generateMockTransactions(35, identity?.address);

        // Ordenar por timestamp más reciente
        mockData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setTransactions(mockData);
        setFilteredTransactions(mockData);
      } catch (error) {
        console.error("Error al cargar transacciones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [identity]);

  // Filtrar transacciones cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = transactions.filter(
      (tx) =>
        tx.sourceAddress.toLowerCase().includes(term) ||
        tx.targetAddress.toLowerCase().includes(term) ||
        tx.amount.includes(term) ||
        tx.tick.toString().includes(term)
    );

    setFilteredTransactions(filtered);
    setPage(0); // Resetear a la primera página
  }, [searchTerm, transactions]);

  // Manejadores
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Renderizar tipo de transacción - Corregido para TypeScript
  const renderTransactionType = (type: string, status: string) => {
    let color = "default";

    switch (type) {
      case "transfer":
        color = "primary";
        break;
      case "contract":
        color = "info";
        break;
      case "burn":
        color = "error";
        break;
    }

    // Versión corregida sin icono para evitar el error de tipo
    return (
      <Chip
        label={type.charAt(0).toUpperCase() + type.slice(1)}
        color={color as any}
        variant={status === "pending" ? "outlined" : "filled"}
        size="small"
      />
    );
  };

  // Renderizar dirección truncada
  const truncateAddress = (address: string, length: number = 10) => {
    if (address.length <= length * 2) return address;
    return `${address.substring(0, length)}...${address.substring(
      address.length - length
    )}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Historial de Transacciones
      </Typography>

      <Grid container spacing={3}>
        {/* Filtro y búsqueda */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                placeholder="Buscar por dirección, monto o tick..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
              <Button variant="contained">Buscar</Button>
            </Box>
          </Paper>
        </Grid>

        {/* Resumen de transacciones */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total de Transacciones
              </Typography>
              <Typography variant="h3" color="primary">
                {transactions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Transferencias
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {transactions.filter((tx) => tx.type === "transfer").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Llamadas a Contrato
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    {transactions.filter((tx) => tx.type === "contract").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Quemadas (Burn)
                  </Typography>
                  <Typography variant="h5" color="error">
                    {transactions.filter((tx) => tx.type === "burn").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Tabla de transacciones */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredTransactions.length > 0 ? (
              <>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableBody>
                      {filteredTransactions
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((tx) => (
                          <TableRow key={tx.id} hover>
                            <TableCell>
                              {renderTransactionType(tx.type, tx.status)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={truncateAddress(tx.sourceAddress)}
                                variant="outlined"
                                size="small"
                                color={
                                  identity?.address === tx.sourceAddress
                                    ? "primary"
                                    : "default"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={truncateAddress(tx.targetAddress)}
                                variant="outlined"
                                size="small"
                                color={
                                  identity?.address === tx.targetAddress
                                    ? "primary"
                                    : "default"
                                }
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                color={
                                  identity?.address === tx.sourceAddress
                                    ? "error"
                                    : "success.main"
                                }
                                sx={{ fontWeight: "bold" }}
                              >
                                {identity?.address === tx.sourceAddress
                                  ? "-"
                                  : "+"}
                                {tx.amount} QU
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{tx.tick}</TableCell>
                            <TableCell>
                              {tx.timestamp.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredTransactions.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            ) : (
              <Alert severity="info" sx={{ m: 2 }}>
                No se encontraron transacciones que coincidan con tu búsqueda.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Transactions;
