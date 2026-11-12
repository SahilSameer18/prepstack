class Account {
    String owner;
    int balance;
    Account() { this("unknown", 0); }
    Account(String owner) { this(owner, 0); }
    Account(String owner, int balance) { this.owner = owner; this.balance = balance; }
    Account(Account other) { this(other.owner, other.balance); }   // copy by constructor
    public String toString() { return owner + ":" + balance; }
}
class Plain { int n; }
public class Main {
    public static void main(String[] args) {
        Account a = new Account("Asha", 100);
        Account b = new Account(a);
        b.balance = 5;
        System.out.println(a + " " + b + " " + new Account() + " " + new Account("Ravi"));
        System.out.println(new Plain().n);
    }
}
