public class T4 {
    static class Account {
        private int balance;
        void deposit(int amount) {
            if (amount <= 0) throw new IllegalArgumentException("deposit must be positive"); // stops with an error
            balance += amount;
        }
        int getBalance() { return balance; }
    }
    public static void main(String[] args) {
        Account acc = new Account();
        acc.deposit(100);
        System.out.println(acc.getBalance());
        try {
            acc.deposit(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }
        System.out.println(acc.getBalance());
    }
}
