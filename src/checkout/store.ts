import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { checkoutFailure, getQuote, postOrder } from './api';
import type { Failure, OrderRequest, OrderResult, Quote, QuoteRequest } from './api';

export const quoteKey = (request: QuoteRequest) => JSON.stringify(request);

export const fetchQuote = createAsyncThunk<Quote, QuoteRequest, { rejectValue: Failure }>(
  'checkout/quote',
  async (request, { signal, rejectWithValue }) => {
    try { return await getQuote(request, signal); }
    catch (error) { return rejectWithValue(checkoutFailure(error)); }
  },
);

export const submitOrder = createAsyncThunk<OrderResult, { order: OrderRequest; key: string }, { rejectValue: Failure }>(
  'checkout/order',
  async ({ order, key }, { signal, rejectWithValue }) => {
    try { return await postOrder(order, key, signal); }
    catch (error) { return rejectWithValue(checkoutFailure(error)); }
  },
);

type State = {
  requestId: string;
  key: string;
  quote: Quote | null;
  quoteStatus: 'idle' | 'loading' | 'ready' | 'failed';
  quoteError: Failure | null;
  submitting: boolean;
};

const initialState: State = {
  requestId: '', key: '', quote: null, quoteStatus: 'idle', quoteError: null, submitting: false,
};

const checkout = createSlice({
  name: 'checkout',
  initialState,
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchQuote.pending, (state, action) => {
      state.requestId = action.meta.requestId;
      state.key = quoteKey(action.meta.arg);
      state.quote = null;
      state.quoteError = null;
      state.quoteStatus = 'loading';
    })
    .addCase(fetchQuote.fulfilled, (state, action) => {
      if (state.requestId !== action.meta.requestId) return;
      state.quoteStatus = 'ready';
      state.quote = action.payload;
    })
    .addCase(fetchQuote.rejected, (state, action) => {
      if (state.requestId !== action.meta.requestId || action.meta.aborted) return;
      state.quoteStatus = 'failed';
      state.quoteError = action.payload ?? { code: 'NETWORK', message: 'Không tải được tổng tiền.' };
    })
    .addCase(submitOrder.pending, state => { state.submitting = true; })
    .addMatcher(submitOrder.settled, state => { state.submitting = false; }),
});

export const checkoutStore = configureStore({ reducer: { checkout: checkout.reducer } });
export type CheckoutState = ReturnType<typeof checkoutStore.getState>;
export type CheckoutDispatch = typeof checkoutStore.dispatch;
