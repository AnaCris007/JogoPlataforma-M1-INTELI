// Define a classe da cena
class menu extends Phaser.Scene {
    constructor() {
        super('menu'); //Nome da cena
    }
    preload() { //Carrega as imagens e a música
        this.load.image('telaInicial', 'assets/menu/capa.png');
        this.load.image('botaoJogar', 'assets/menu/botaoJogar.png');
        this.load.image('botaoComoJogar', 'assets/menu/botaoComoJogar.png');
        this.load.audio('musicaMenu', 'assets/fase/musica.mp3');
    }

    create() {
        // Adiciona a música e determina que ela deve tocar sem parar, pois o loop está ativado
        this.musicaMenu = this.sound.add('musicaMenu', {loop: true});
        //Inicia a música
        this.musicaMenu.play();
        //Adiciona a imagem 'telaInicial' a tela do jogo
        this.add.image(450, 300, 'telaInicial');
        //Cria o botao para iniciar o jogo, com base na imagem 'botaoJogar'
        this.botaoIniciar = this.add.image(455, 315, 'botaoJogar').setInteractive().setDepth(-1);
        //Com .setDepth(-1) eu defino a camada dos botões como sendo atrás de outros elementos na tela
        //Com o .setInteractive() eu consigo transformar uma imagem em um botão clicável
        //Cria o botao que vai explicar para o jogador como jogar o jogo
        this.botaoComo = this.add.image(455, 445, 'botaoComoJogar').setInteractive().setDepth(-1);

        //Se o jogador apertar o botaoIniciar...
        this.botaoIniciar.on('pointerdown', () => {
            this.musicaMenu.stop(); //A música que tá tocando para
            this.scene.start("fase1"); //A fase1 começa
        });

        //Se o jogador apertar o botaoComo...
        this.botaoComo.on('pointerdown', () => {
            this.musicaMenu.stop(); // Para a música atual
            this.scene.start('comoJogar'); // Vai pra cena comoJogar, que contém as instruções pra jogar o jogo
        });
    }

    update() { //Atualiza elementos na tela, mas nessa cena não foi necessário usar essa função 

    }
}
