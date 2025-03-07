//Define a classe da cena
class perdeu extends Phaser.Scene {
    constructor () {
        super('perdeu'); //Nome da cena
    }

    preload() { //Carrega as imagens e a música da cena
        this.load.image('perdeu', 'assets/fase/perdeu.png');
        this.load.image('mensagemPerdeu', 'assets/fase/mensagemPerdeu.png');
        this.load.audio('perdeuMusica', 'assets/fase/perdeuMusica.mp3');
    }

    create() {
        //Adiciona a música e determina que ela deve tocar sem parar, pois o loop está ativado
        this.perdeuMusica = this.sound.add('perdeuMusica', {loop: true});
        //Inicia a música
        this.perdeuMusica.play();
        
        // Exibe a imagem "perdeu"
        this.perdeu = this.add.image(450, 320, 'perdeu');
        
        // Espera 4 segundos e troca a imagem 'perdeu' para "mensagemPerdeu"
        this.time.delayedCall(4000, () => {
            // Troca a imagem para "mensagemPerdeu"
            this.perdeu.setTexture('mensagemPerdeu');
            
            //Quando o jogador pressionar Enter chama o método reiniciar o jogo
            this.input.keyboard.on('keydown-ENTER', this.reiniciarJogo, this);
        });
    }

    //Essa função para a música e manda para a cena 'fase1'
    reiniciarJogo() {
        this.perdeuMusica.stop();
        this.scene.start('fase1'); //Reinicia o jogo, o jogador volta no começo da fase
    }
}
