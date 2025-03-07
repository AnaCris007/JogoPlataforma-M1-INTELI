//Define a classe dessa cena
class ganhou extends Phaser.Scene {
    constructor() {
        super('ganhou'); //Nome da cena
    }

    preload () { //carrega as imagens e a música da cena
        this.load.image('ganhou', 'assets/fase/ganhou.png');
        this.load.image('mensagemGanhou', 'assets/fase/mensagemGanhou.png');
        this.load.audio('ganhouMusica', 'assets/fase/ganhouMusica.mp3');
    }

    create () {
        //Adiciona música e determina que ela deve tocar em loop, ou seja, ela não deve ter fim
        this.ganhouMusica = this.sound.add('ganhouMusica', {loop: true});
        //Inicia a música
        this.ganhouMusica.play();
        //Adiciona na tela a imagem 'ganhou'
        this.ganhou = this.add.image(450, 320, 'ganhou');

        //Depois de 4 segunods...
        this.time.delayedCall(4000, () => {
            // Troca a imagem 'ganhou' para "mensagemGanhou"
            this.ganhou.setTexture('mensagemGanhou');
            
            // Quando o jogador pressionar enter o jogo vai chamar o método voltar
            this.input.keyboard.on('keydown-ENTER', this.voltar, this);
        });
    }

    //Essa função para a música e inicia a cena 'menu', ou seja, manda o jogador de volta ao menu inicial do jogo
    voltar () {
        this.ganhouMusica.stop();
        this.scene.start('menu');
    }
}