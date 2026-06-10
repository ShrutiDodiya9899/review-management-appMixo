import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Stack,
  Alert,
  CircularProgress,
  Box,

  Pagination,
  PaginationItem,
} from "@mui/material";

import {
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  WarningAmber,
  Add,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";

const API_URL = import.meta.env.VITE_API_URL;
const pageLimit = import.meta.env.VITE_PAGE_LIMIT;

interface Review {
  _id: string;
  author: string;
  rating: number;
  text: string;
  riskScore: number;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
}

type DialogMode = "view" | "edit" | "reject" | "create" | null;

export default function App() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);

  const [formAuthor, setFormAuthor] = useState("");

  const [formRating, setFormRating] = useState<number | null>(5);

  const [formText, setFormText] = useState("");

  const [rejectionInput, setRejectionInput] = useState("");

  const [errors, setErrors] = useState<{
    rating?: string;
    text?: string;
    rejection?: string;
  }>({});

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}?page=${page}&limit=${pageLimit}`,
      );

      setReviews(response.data.data || response.data);
      setTotalPages(response.data.total);
      setApiError("");
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setSelectedReview(null);
    setErrors({});
  };

  const handleOpenDialog = (review: Review, mode: DialogMode) => {
    setSelectedReview(review);
    setDialogMode(mode);
    setErrors({});

    if (mode === "edit") {
      setFormAuthor(review.author);
      setFormRating(review.rating);
      setFormText(review.text);
    }

    if (mode === "reject") {
      setRejectionInput("");
    }
  };

  const handleOpenCreate = () => {
    setDialogMode("create");

    setFormAuthor("");
    setFormRating(5);
    setFormText("");
    setErrors({});
  };

  const validateReview = () => {
    const validationErrors: any = {};

    if (!formRating || formRating < 1 || formRating > 5) {
      validationErrors.rating = "Rating must be between 1 and 5";
    }

    if (!formText.trim()) {
      validationErrors.text = "Review text is required";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleCreateReview = async () => {
    if (!validateReview()) return;

    try {
      await axios.post(API_URL, {
        productId: "prod_987654322",
        author: formAuthor || "Anonymous",
        rating: formRating,
        text: formText,
      });

      fetchReviews();
      handleCloseDialog();
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "Create failed");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedReview) return;

    if (!validateReview()) return;

    try {
      await axios.put(`${API_URL}/${selectedReview._id}`, {
        rating: formRating,
        text: formText,
      });

      fetchReviews();
      handleCloseDialog();
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "Update failed");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`${API_URL}/${id}/approve`);

      fetchReviews();
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async () => {
    if (!selectedReview) return;

    if (!rejectionInput.trim()) {
      setErrors({
        rejection: "Rejection reason is mandatory",
      });
      return;
    }

    try {
      await axios.post(`${API_URL}/${selectedReview._id}/reject`, {
        moderatorReason: rejectionInput,
      });

      fetchReviews();
      handleCloseDialog();
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "Reject failed");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between" }}
      >
        <Typography variant="h4">Review Moderation Dashboard</Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          Create Review
        </Button>
      </Stack>

      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Author</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {reviews.map((review) => {
                const highRisk = review.riskScore >= 75;

                return (
                  <TableRow
                    key={review._id}
                    sx={{
                      backgroundColor: highRisk ? "#ffebee" : "inherit",
                      borderLeft: highRisk ? "5px solid #d32f2f" : "none",
                    }}
                  >
                    <TableCell>{review.author}</TableCell>

                    <TableCell>
                      <Rating readOnly value={review.rating} />
                    </TableCell>

                    <TableCell>
                      {review.text.length > 60
                        ? review.text.substring(0, 60) + "..."
                        : review.text}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`${review.riskScore}%`}
                          color={
                            highRisk
                              ? "error"
                              : review.riskScore > 40
                                ? "warning"
                                : "success"
                          }
                        />

                        {highRisk && <WarningAmber color="error" />}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={review.status}
                        color={
                          review.status === "Approved"
                            ? "success"
                            : review.status === "Rejected"
                              ? "error"
                              : "default"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <IconButton
                          onClick={() => handleOpenDialog(review, "view")}
                        >
                          <Visibility />
                        </IconButton>

                        <IconButton
                          onClick={() => handleOpenDialog(review, "edit")}
                        >
                          <Edit />
                        </IconButton>

                        <Button
                          color="success"
                          variant="contained"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(review._id)}
                        >
                          Approve
                        </Button>

                        <Button
                          color="error"
                          variant="contained"
                          startIcon={<Cancel />}
                          onClick={() => handleOpenDialog(review, "reject")}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
       <Stack
       
        direction="row"
        sx={{ justifyContent: "center",margin: '20px 0px 20px 0px'  }}
      >
           <Pagination
            page={page}
            count={totalPages}
            color="primary"
            onChange={(_, value) => {
              setPage(value);
            }}
            renderItem={(item) => (
              <PaginationItem
                slots={{
                  previous: ArrowBackIos,
                  next: ArrowForwardIos,
                }}
                {...item}
              />
            )}
          />
       </Stack>
        </TableContainer>
      )}

      {/* View / Edit / Create / Reject Dialog */}
      <Dialog
        open={dialogMode !== null}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogMode === "view" && "Review Details"}
          {dialogMode === "edit" && "Edit Review"}
          {dialogMode === "create" && "Create Review"}
          {dialogMode === "reject" && "Reject Review"}
        </DialogTitle>

        <DialogContent dividers>
          {/* View Mode */}
          {dialogMode === "view" && selectedReview && (
            <Stack spacing={2}>
              <TextField
                label="Author"
                value={selectedReview.author}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              <Box>
                <Typography gutterBottom>Rating</Typography>
                <Rating readOnly value={selectedReview.rating} />
              </Box>

              <TextField
                label="Review"
                value={selectedReview.text}
                multiline
                rows={4}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              <TextField
                label="Risk Score"
                value={`${selectedReview.riskScore}%`}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              <TextField
                label="Status"
                value={selectedReview.status}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              {selectedReview.rejectionReason && (
                <TextField
                  label="Rejection Reason"
                  value={selectedReview.rejectionReason}
                  multiline
                  rows={3}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            </Stack>
          )}

          {/* Create & Edit Mode */}
          {(dialogMode === "create" || dialogMode === "edit") && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Author"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                fullWidth
                disabled={dialogMode === "edit"}
              />

              <Box>
                <Typography gutterBottom>Rating</Typography>

                <Rating
                  value={formRating}
                  onChange={(_, value) => setFormRating(value)}
                />

                {errors.rating && (
                  <Typography color="error" variant="caption" display="block">
                    {errors.rating}
                  </Typography>
                )}
              </Box>

              <TextField
                label="Review Text"
                multiline
                rows={4}
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                fullWidth
                error={!!errors.text}
                helperText={errors.text}
              />
            </Stack>
          )}

          {/* Reject Mode */}
          {dialogMode === "reject" && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography>
                Please provide a reason for rejecting this review.
              </Typography>

              <TextField
                label="Rejection Reason"
                multiline
                rows={4}
                value={rejectionInput}
                onChange={(e) => setRejectionInput(e.target.value)}
                fullWidth
                error={!!errors.rejection}
                helperText={errors.rejection}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>

          {dialogMode === "create" && (
            <Button variant="contained" onClick={handleCreateReview}>
              Create
            </Button>
          )}

          {dialogMode === "edit" && (
            <Button variant="contained" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          )}

          {dialogMode === "reject" && (
            <Button color="error" variant="contained" onClick={handleReject}>
              Reject Review
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
