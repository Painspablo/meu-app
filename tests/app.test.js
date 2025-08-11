describe('Testes iniciais', () => {
  test('A soma de 1 e 1 deve ser 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('O resultado de uma string de texto deve ser igual', () => {
    const texto = "Olá mundo";
    expect(texto).toBe("Olá mundo");
  });
});
