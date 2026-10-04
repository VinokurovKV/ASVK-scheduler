import {
  AttachFileRounded,
  ChatOutlined,
  CloseRounded,
  InfoOutlined,
  KeyboardArrowDownRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useRef, useState } from "react";

import { getCurrentUser } from "../api/auth";
import { AUTH_QUERY_KEY } from "../api/authQuery";
import { createSupportRequest } from "../api/support";

const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatFileSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1).replace(".0", "")} МБ`;
  }

  return `${Math.max(1, Math.round(size / 1024))} КБ`;
};

const requestTopics = [
  "Проблема с расписанием",
  "Проблема с событием",
  "Проблема со входом",
  "Предложение",
  "Другое",
];

const requestCategories = [
  "Некорректные данные",
  "Ошибка интерфейса",
  "Не работает функция",
  "Вопрос по приложению",
  "Другое",
];

const FieldLabel = ({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) => (
  <Typography
    component="label"
    sx={{ display: "block", mb: 0.65, fontSize: "0.78rem", fontWeight: 700 }}
  >
    {children}
    {required && (
      <Box component="span" sx={{ ml: 0.35, color: "error.main" }}>
        *
      </Box>
    )}
  </Typography>
);

const SupportForm = ({ defaultEmail }: { defaultEmail: string }) => {
  const [topic, setTopic] = useState(requestTopics[0]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [toast, setToast] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const mutation = useMutation({
    mutationFn: createSupportRequest,
    onSuccess: (request) => {
      setCategory("");
      setDescription("");
      setWasSubmitted(false);
      handleFileRemove();
      setToast({
        severity: "success",
        message: `Обращение №${request.id} успешно отправлено`,
      });
    },
    onError: (error) => {
      const message = (() => {
        if (error.message.includes("attachment is too large")) {
          return "Размер файла не должен превышать 10 МБ";
        }

        if (error.message.includes("attachment type is not supported")) {
          return "Этот тип файла не поддерживается";
        }

        return "Не удалось отправить обращение";
      })();

      setToast({ severity: "error", message });
    },
  });

  const handleFileChange = (file?: File) => {
    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFileError("Размер файла не должен превышать 10 МБ");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedFile(file);
    setFileError("");
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWasSubmitted(true);

    if (
      !category ||
      !description.trim() ||
      description.trim().length > MAX_DESCRIPTION_LENGTH ||
      !emailIsValid ||
      fileError
    ) {
      return;
    }

    mutation.mutate({
      topic,
      category,
      description: description.trim(),
      replyEmail: email.trim(),
      attachment: selectedFile,
    });
  };

  return (
    <>
      <Paper
        component="form"
        noValidate
        elevation={0}
        onSubmit={handleSubmit}
        sx={{
        width: "100%",
        minHeight: { xs: "calc(100dvh - 96px)", md: "auto" },
        maxWidth: { xs: 560, md: "none" },
        mx: "auto",
          display: "flex",
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.app.brand.navy, 0.06),
          borderRadius: 3,
        p: { xs: 1.5, md: 3 },
      }}
    >
        <Stack spacing={{ xs: 2, md: 1.4 }} sx={{ width: "100%", flex: 1 }}>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              mb: 0.25,
            }}
          >
            <ChatOutlined sx={{ color: "primary.main", fontSize: 30 }} />
            <Typography sx={{ fontSize: "1.3rem", fontWeight: 750 }}>
              Новое обращение
            </Typography>
          </Stack>
          <Box>
            <FieldLabel required>Тема обращения</FieldLabel>
            <Select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              IconComponent={KeyboardArrowDownRounded}
              fullWidth
              size="small"
              inputProps={{ "aria-label": "Тема обращения" }}
            >
              {requestTopics.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <FieldLabel required>Категория</FieldLabel>
            <Select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              error={wasSubmitted && !category}
              displayEmpty
              IconComponent={KeyboardArrowDownRounded}
              fullWidth
              size="small"
              inputProps={{ "aria-label": "Категория" }}
              renderValue={(value) =>
                value || (
                  <Typography component="span" color="text.secondary">
                    Выберите категорию
                  </Typography>
                )
              }
            >
              {requestCategories.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>

            {wasSubmitted && !category && (
              <Typography
                color="error.main"
                sx={{ mt: 0.5, ml: 1.75, fontSize: "0.7rem" }}
              >
                Выберите категорию
              </Typography>
            )}
          </Box>

          <Box>
            <FieldLabel required>Описание проблемы</FieldLabel>
            <TextField
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Опишите, что произошло. Чем подробнее вы расскажете о проблеме, тем быстрее мы сможем помочь."
              multiline
              minRows={5}
              fullWidth
              error={wasSubmitted && !description.trim()}
              slotProps={{
                htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH },
                formHelperText: { sx: { mt: 0.4, mr: 0, textAlign: "right" } },
              }}
              helperText={
                wasSubmitted && !description.trim()
                  ? "Опишите проблему"
                  : `${description.length}/${MAX_DESCRIPTION_LENGTH}`
              }
            />
          </Box>

          <Box>
            <FieldLabel required>Почта для ответа</FieldLabel>
            <TextField
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@asvk.msu.ru"
              autoComplete="email"
              fullWidth
              size="small"
              error={wasSubmitted && !emailIsValid}
              helperText={
                wasSubmitted && !emailIsValid
                  ? "Введите корректный адрес почты"
                  : undefined
              }
            />
          </Box>

          <Box>
          <FieldLabel>
            Прикрепить скриншот{" "}
            <Box
              component="span"
              sx={{ color: "text.secondary", fontWeight: 400 }}
            >
              (необязательно)
            </Box>
          </FieldLabel>
            <ButtonBase
              component="label"
              sx={{
                position: "relative",
                display: "flex",
              width: "100%",
              minHeight: { xs: 112, md: 92 },
                alignItems: "center",
                justifyContent: "flex-start",
                border: "1px dashed",
                borderColor: fileError
                  ? "error.main"
                  : selectedFile
                    ? "app.status.success.text"
                    : "primary.light",
                borderRadius: 2.5,
                bgcolor: selectedFile
                  ? (theme) =>
                      alpha(theme.palette.app.status.success.text, 0.045)
                  : "transparent",
                gap: 1.5,
                px: 1.25,
                pr: selectedFile ? 5 : 1.25,
                py: 1.25,
                textAlign: "left",
              }}
            >
              <Box
                component="input"
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt,.doc,.docx"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
                sx={{ display: "none" }}
              />

              <Box
                sx={{
                  display: "grid",
                  width: 52,
                  height: 52,
                  flexShrink: 0,
                  placeItems: "center",
                  borderRadius: 2.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: selectedFile
                    ? "app.status.success.text"
                    : "primary.main",
                }}
              >
                <AttachFileRounded sx={{ fontSize: 30 }} />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    overflow: "hidden",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedFile?.name ?? "Нажмите для выбора файла"}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mt: 0.35, fontSize: "0.72rem", lineHeight: 1.35 }}
                >
                  {selectedFile ? (
                    <>Размер файла: {formatFileSize(selectedFile.size)}</>
                  ) : (
                    <>
                      Поддерживаются изображения, PDF и текстовые файлы.
                      <br />
                      Максимальный размер — 10 МБ.
                    </>
                  )}
                </Typography>
              </Box>

              {selectedFile && (
                <IconButton
                  aria-label="Удалить прикреплённый файл"
                  size="small"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleFileRemove();
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "text.secondary",
                  }}
                >
                  <CloseRounded fontSize="small" />
                </IconButton>
              )}
            </ButtonBase>

            {fileError && (
              <Typography
                color="error.main"
                sx={{ mt: 0.5, fontSize: "0.7rem" }}
              >
                {fileError}
              </Typography>
            )}
          </Box>

          <Stack
            direction="row"
            spacing={1.1}
            sx={{
              alignItems: "center",
              borderRadius: 2.5,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.065),
              color: "primary.main",
              px: 1.25,
              py: 1.15,
            }}
          >
            <InfoOutlined sx={{ flexShrink: 0, fontSize: 22 }} />
            <Typography sx={{ fontSize: "0.74rem", lineHeight: 1.4 }}>
              Мы постараемся ответить на ваше обращение в течение 1–2 рабочих
              дней.
            </Typography>
          </Stack>

          <Button
            type="submit"
            variant="contained"
          fullWidth
          disabled={mutation.isPending}
          sx={{
            width: { xs: "100%", md: 320 },
            minHeight: 48,
            mt: { xs: "auto !important", md: "16px !important" },
            alignSelf: { md: "flex-start" },
          }}
          >
            {mutation.isPending ? "Отправка..." : "Отправить обращение"}
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        disableWindowBlurListener
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast?.severity ?? "success"}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ width: "100%", boxShadow: (theme) => theme.appShadows.toast }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export const SupportPage = () => {
  const { data: user } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        component="h1"
        sx={{
          display: { xs: "none", md: "block" },
          fontSize: "2.125rem",
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        Поддержка
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          display: { xs: "none", md: "block" },
          mt: 0.5,
          mb: 2.5,
          fontSize: "0.95rem",
        }}
      >
        Опишите проблему или задайте вопрос — мы поможем найти решение.
      </Typography>

      <SupportForm
        key={user?.id ?? "support-form"}
        defaultEmail={user?.email ?? ""}
      />
    </Box>
  );
};
