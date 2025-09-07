
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import { useStorage } from '@/hooks/use-storage';
import { onSnapshot, addDoc } from '@/lib/storage';


type TransactionType = 'income' | 'expense';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
};

export default function BudgetTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const { t } = useLanguage();
  const { storageMode } = useStorage();

  useEffect(() => {
    const unsubscribe = onSnapshot('transactions', (snapshot) => {
      const transactionsData: Transaction[] = snapshot.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          description: data.description,
          amount: data.amount,
          type: data.type,
          date: new Date(data.date)
        } as Transaction
      });
      transactionsData.sort((a,b) => b.date.getTime() - a.date.getTime());
      setTransactions(transactionsData);
    });

    return () => {
      if(unsubscribe) unsubscribe();
    };
  }, [storageMode]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    await addDoc('transactions', {
        description,
        amount: parseFloat(amount),
        type,
        date: new Date().toISOString(),
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
        <h1 className="text-3xl font-bold mb-6">{t('budgetTracker')}</h1>
        <Card>
          <CardHeader>
            <CardTitle>{t('addNewTransaction')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Groceries"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{t('amount')}</Label>
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
                  <Label htmlFor="income">{t('income')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">{t('expense')}</Label>
                </div>
              </RadioGroup>
              <Button type="submit">{t('addTransaction')}</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('recentTransactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {transactions.length === 0 && <p className="text-muted-foreground">{t('noTransactionsYet')}</p>}
              {transactions.map(transaction => (
                <li key={transaction.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date.toLocaleDateString()}</p>
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
         <h1 className="text-3xl font-bold mb-6 invisible">{t('summary')}</h1>
        <Card>
          <CardHeader>
            <CardTitle>{t('summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('totalIncome')}</span>
              <span className="font-medium text-green-500">${totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('totalExpenses')}</span>
              <span className="font-medium text-red-500">${totalExpenses.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>{t('currentBalance')}</span>
              <span>${currentBalance.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
