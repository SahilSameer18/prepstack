interface A { default String hi() { return "A"; } }
interface B { default String hi() { return "B"; } }
class Both implements A, B {
    public String hi() { return A.super.hi() + B.super.hi(); }
}
class Base { public String hi() { return "Base"; } }
class Mixed extends Base implements A { }
interface B2 extends A { default String hi() { return "B2"; } }
class Related implements A, B2 { }
public class Main {
    public static void main(String[] args) {
        System.out.println(new Both().hi());
        System.out.println(new Mixed().hi());
        System.out.println(new Related().hi());
    }
}
