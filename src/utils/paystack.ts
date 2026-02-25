import axios, { AxiosError } from "axios";
import { config } from "../config/app.config";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackHeaders = {
  Authorization: `Bearer ${config.paystackSecretKey}`,
  "Content-Type": "application/json",
};

// Initialize a Paystack transaction. Amount should be in kobo (naira × 100).
export const initializeTransaction = async (
  email: string,
  amount: number,
  reference: string,
  callbackUrl: string,
) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount,
        reference,
        callback_url: callbackUrl,
      },
      { headers: paystackHeaders },
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Failed to reach Paystack";
    throw new Error(`Paystack initialization error: ${message}`);
  }
};

// Verify a Paystack transaction by its reference.
export const verifyTransaction = async (reference: string) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: paystackHeaders },
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Failed to reach Paystack";
    throw new Error(`Paystack verification error: ${message}`);
  }
};
