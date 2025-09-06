"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';


type TransactionType = 'income' | 'expense';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
};

export default function BudgetTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');

  useEffect(() => {
    const q = collection(db, 'transactions');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({ 
          id: doc.id, 
          ...data,
          date: data.date ? new Date(data.date.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()
        } as Transaction);
      });
      transactionsData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(transactionsData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    await addDoc(collection(db, 'transactions'), {
        description,
        amount: parseFloat(amount),
        type,
        date: new Date(),
    });

    setDescription('');
    setAmount('');
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const currentBalance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold mb-6">Budget Tracker</h1>
        <Card>
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Groceries"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 50.00"
                  required
                />
              </div>
              <RadioGroup value={type} onValueChange={(value: TransactionType) => setType(value)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Income</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">Expense</Label>
                </div>
              </RadioGroup>
              <Button type="submit">Add Transaction</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {transactions.length === 0 && <p className="text-muted-foreground">No transactions yet.</p>}
              {transactions.map(transaction => (
                <li key={transaction.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <p className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
         <h1 className="text-3xl font-bold mb-6 invisible">Summary</h1>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Income</span>
              <span className="font-medium text-green-500">${totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-medium text-red-500">${totalExpenses.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Current Balance</span>
              <span>${currentBalance.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
