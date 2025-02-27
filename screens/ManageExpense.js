import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { useContext, useLayoutEffect, useState } from "react";
import IconButton from "../components/UI/IconButton";
import { GlobalStyles } from "../constants/styles";
import Button from "../components/UI/Button";
import ExpenseItem from "../components/ExpensesOutput/ExpenseItem";
import { ExpensesContext } from "../store/expenses-context";
import ExpenseForm from "../components/ManageExpense/ExpenseForm";
import { storeExpense, updateExpense, deleteExpense } from "../util/http";
import LoadingOverlay from "../components/UI/LoadingOverlay";
import ErrorOverlay from "../components/UI/ErrorOverlay";

function ManageExpense({ route, navigation }) {
  const expensesCtx = useContext(ExpensesContext);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const editedExpenseId = route.params?.expenseId;
  const isEditing = !!editedExpenseId; // falsy value to false and true value to true

  const selectedExpense = expensesCtx.expenses.find(
    (expense) => expense.id === editedExpenseId
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit Expense" : "Add Expense",
    });
  }, [navigation, isEditing]);

  async function handleDeleteExpense() {
    setIsFetching(true);
    try {
      await deleteExpense(editedExpenseId);
      expensesCtx.deleteExpense(editedExpenseId);
      navigation.goBack();
    } catch (err) {
      setError("Could not delete expense - please try again later!");
      setIsFetching(false);
    }
  }

  function handleCancel() {
    navigation.goBack();
  }
  async function handleConfirm(expenseData) {
    try {
      if (isEditing) {
        expensesCtx.updateExpense(editedExpenseId, expenseData);
        setIsFetching(true);
        await updateExpense(editedExpenseId, expenseData);
      } else {
        setIsFetching(true);
        const id = await storeExpense(expenseData);
        expensesCtx.addExpense({ ...expenseData, id: id });
      }
      navigation.goBack();
    } catch (err) {
      setError("Could not save data - please try again later");
      setIsFetching(false);
    }
  }

  function handleError() {
    setError(null);
  }

  if (error && !isFetching) {
    return <ErrorOverlay message={error} onConfirm={handleError} />;
  }

  if (isFetching) {
    return <LoadingOverlay />;
  }

  return (
    <View style={styles.container}>
      <ExpenseForm
        onCancel={handleCancel}
        submitButtonLabel={isEditing ? "Update" : "Add"}
        onSubmit={handleConfirm}
        defaultValues={selectedExpense}
      />
      {isEditing && (
        <View style={styles.deleteContainer}>
          <IconButton
            icon="trash"
            color={GlobalStyles.colors.error500}
            size={36}
            onPress={handleDeleteExpense}
          />
        </View>
      )}
    </View>
  );
}

export default ManageExpense;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: GlobalStyles.colors.primary800,
  },
  deleteContainer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: GlobalStyles.colors.primary200,
    alignItems: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    minWidth: 120,
    marginHorizontal: 8,
  },
});
