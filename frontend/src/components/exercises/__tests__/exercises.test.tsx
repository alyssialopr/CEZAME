import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BucketExercise } from '../BucketExercise';
import { DocumentExercise } from '../DocumentExercise';
import { MatchingExercise } from '../MatchingExercise';
import { OrderExercise } from '../OrderExercise';
import { ScamExercise } from '../ScamExercise';
import { ScenarioExercise } from '../ScenarioExercise';

describe('MatchingExercise', () => {
  const pairs = [
    { id: 'p1', left: 'CPAM', right: 'Rembourse les soins' },
    { id: 'p2', left: 'Mutuelle', right: 'Complète le remboursement' },
  ];

  it('signale une mauvaise paire puis termine quand tout est associé', async () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();
    const onMistake = jest.fn();
    await render(<MatchingExercise pairs={pairs} isRevealed={false} onComplete={onComplete} onMistake={onMistake} />);

    await fireEvent.press(screen.getByTestId('matching-left-p1'));
    await fireEvent.press(screen.getByTestId('matching-right-p2'));
    expect(onMistake).toHaveBeenCalledTimes(1);
    await act(() => jest.advanceTimersByTime(700));

    await fireEvent.press(screen.getByTestId('matching-left-p1'));
    await fireEvent.press(screen.getByTestId('matching-right-p1'));
    await fireEvent.press(screen.getByTestId('matching-left-p2'));
    await fireEvent.press(screen.getByTestId('matching-right-p2'));

    expect(onComplete).toHaveBeenCalledWith(true);
    expect(screen.getByText(/toutes les associations sont complètes/)).toBeTruthy();
    jest.useRealTimers();
  });

  it('ignore un clic à droite sans sélection à gauche', async () => {
    const onMistake = jest.fn();
    await render(<MatchingExercise pairs={pairs} isRevealed={false} onComplete={jest.fn()} onMistake={onMistake} />);
    await fireEvent.press(screen.getByTestId('matching-right-p1'));
    expect(onMistake).not.toHaveBeenCalled();
  });

  it('permet de relier dans les deux sens (droite puis gauche)', async () => {
    const onComplete = jest.fn();
    await render(<MatchingExercise pairs={pairs} isRevealed={false} onComplete={onComplete} onMistake={jest.fn()} />);

    // Clic d'abord à droite, puis à gauche
    await fireEvent.press(screen.getByTestId('matching-right-p1'));
    await fireEvent.press(screen.getByTestId('matching-left-p1'));

    await fireEvent.press(screen.getByTestId('matching-right-p2'));
    await fireEvent.press(screen.getByTestId('matching-left-p2'));

    expect(onComplete).toHaveBeenCalledWith(true);
  });
});

describe('OrderExercise', () => {
  it('mélange au départ puis signale le bon ordre une fois remis', async () => {
    const onOrderChange = jest.fn();
    const items = [
      { id: 'a', text: 'Remplir le formulaire' },
      { id: 'b', text: 'Envoyer les justificatifs' },
    ];
    await render(<OrderExercise items={items} isRevealed={false} onOrderChange={onOrderChange} />);

    // Avec 2 éléments, le mélange inverse forcément l'ordre.
    expect(onOrderChange).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByTestId('order-down-0'));
    expect(onOrderChange).toHaveBeenLastCalledWith(true);
  });

  it('permet déchanger deux éléments en les touchant successivement (tap-to-swap)', async () => {
    const onOrderChange = jest.fn();
    const items = [
      { id: 'a', text: 'Remplir le formulaire' },
      { id: 'b', text: 'Envoyer les justificatifs' },
    ];
    await render(<OrderExercise items={items} isRevealed={false} onOrderChange={onOrderChange} />);

    // Avec 2 éléments mélangés (b puis a), toucher b puis a les échange
    await fireEvent.press(screen.getByText('Envoyer les justificatifs'));
    await fireEvent.press(screen.getByText('Remplir le formulaire'));
    expect(onOrderChange).toHaveBeenLastCalledWith(true);
  });
});

describe('ScamExercise', () => {
  const data = { sender: 'Ameli', channel: 'sms' as const, message: 'Cliquez ici', isScam: true, redFlags: ['Lien suspect'] };

  it('transmet le choix de l’utilisateur', async () => {
    const onChoose = jest.fn();
    await render(<ScamExercise data={data} userChoice={null} isRevealed={false} onChoose={onChoose} />);
    expect(screen.getByText('Ameli')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('scam-choice-legit'));
    expect(onChoose).toHaveBeenCalledWith(false);
  });

  it('montre les indices une fois la réponse révélée', async () => {
    await render(<ScamExercise data={data} userChoice={true} isRevealed onChoose={jest.fn()} />);
    expect(screen.getByText('Lien suspect')).toBeTruthy();
  });
});

describe('DocumentExercise', () => {
  it('renvoie le champ choisi', async () => {
    const onSelectField = jest.fn();
    const fields = [
      { id: 'nom', label: 'Nom', value: 'DUPONT' },
      { id: 'nir', label: 'N° de sécurité sociale', value: '1 99 01…', correct: true },
    ];
    await render(<DocumentExercise fields={fields} selectedFieldId={null} isRevealed={false} onSelectField={onSelectField} />);
    await fireEvent.press(screen.getByTestId('document-field-nir'));
    expect(onSelectField).toHaveBeenCalledWith(fields[1]);
  });
});

describe('ScenarioExercise', () => {
  it("renvoie l'option choisie", async () => {
    const onSelectOption = jest.fn();
    const data = {
      context: 'Ton propriétaire garde ta caution.',
      options: [
        { id: 'o1', text: 'Je laisse tomber', correct: false },
        { id: 'o2', text: 'J’envoie une mise en demeure', correct: true },
      ],
    };
    await render(<ScenarioExercise data={data} selectedOptionId={null} isRevealed={false} onSelectOption={onSelectOption} />);
    expect(screen.getByText('Ton propriétaire garde ta caution.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('scenario-option-o2'));
    expect(onSelectOption).toHaveBeenCalledWith(data.options[1]);
  });
});

describe('BucketExercise', () => {
  it("transmet l'affectation d'un élément à un bac", async () => {
    const onAssign = jest.fn();
    const data = {
      buckets: [{ id: 'b1', label: 'Besoins' }, { id: 'b2', label: 'Envies' }],
      items: [{ id: 'i1', text: 'Loyer', bucketId: 'b1' }],
    };
    await render(<BucketExercise data={data as any} userAssignments={{}} isRevealed={false} onAssign={onAssign} />);
    await fireEvent.press(screen.getByTestId('bucket-i1-b2'));
    expect(onAssign).toHaveBeenCalledWith('i1', 'b2');
  });
});
