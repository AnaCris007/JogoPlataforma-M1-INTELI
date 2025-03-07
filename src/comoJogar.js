//Define a classe da cena 
class comoJogar extends Phaser.Scene {
    constructor() {
        super('comoJogar'); //Nome dessa cena
    }

    preload() {
        //Carrega a imagem explicando como jogar 
        this.load.image('comoJogar', 'assets/fase/comoJogar.png');
        this.load.audio('musica', 'assets/fase/musica.mp3')
    }

    create() {
        //adiciona a imagem na tela
        this.musica = this.sound.add('musica', {loop: true});
        this.musica.play();
        this.add.image(450, 340, 'comoJogar');

        //Esse comando faz com que quando o jogador apertar a tecla espaço no teclado ele volta pro menu
        this.input.keyboard.on('keydown-SPACE', () => {
            this.musica.stop(); // Para a música atual
            this.scene.start('menu'); // Inicia a cena menu
        });
    }
}
